import {HttpFunction} from '@google-cloud/functions-framework';
import {Storage} from '@google-cloud/storage';
import textToSpeech, {protos} from '@google-cloud/text-to-speech';
import {db} from './db';
const crypto = require('crypto');

type ArticleType = {
  id: string;
  title: string;
  sentences: {text: string; audioURL?: string}[];
  siteName: string;
  url: string;
};

const fetchAritcle = async (id: string) => {
  return await db.collection('articles').doc(id);
};

const synthesizeSpeech = async (text: string) => {
  const client = new textToSpeech.TextToSpeechClient({
    projectId: process.env.GCP_PROJECT,
  });
  const request: protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest =
    {
      input: {text},
      voice: {
        languageCode: 'ja-JP',
        ssmlGender: protos.google.cloud.texttospeech.v1.SsmlVoiceGender.FEMALE,
      },
      audioConfig: {
        audioEncoding: protos.google.cloud.texttospeech.v1.AudioEncoding.MP3,
      },
    };
  const [response] = await client.synthesizeSpeech(request);
  return response.audioContent;
};

const saveToBucket = async (
  filename: string,
  audioContent: string | Uint8Array | null | undefined
) => {
  if (audioContent instanceof Uint8Array) {
    const storage = new Storage();
    const bucket = storage.bucket(process.env.STORAGE_BUCKET ?? '');
    const file = bucket.file(filename);
    const buffer = audioContent.buffer;
    return file.save(Buffer.from(buffer), {
      metadata: {
        contentType: 'audio/mpeg',
        metadata: {source: 'text-to-speech'},
      },
    });
  }
};

export const addAudio: HttpFunction = async (request, response) => {
  try {
    const {id} = request.body;
    if (!id) {
      throw new Error('id is empty');
    }
    const docRef = await fetchAritcle(id);
    const article = (await (await docRef.get()).data()) as ArticleType;
    if (article) {
      const sentences = await Promise.all(
        article.sentences.map(async sentence => {
          const {text} = sentence;
          const filename = `${id}/${crypto
            .createHash('sha256')
            .update(text)
            .digest('hex')}.mp3`;
          const audioContent = await synthesizeSpeech(text);
          await saveToBucket(filename, audioContent);
          return {
            text,
            audioURL: `https://storage.googleapis.com/voice-ii-men-333213-audio/${filename}`,
          };
        })
      );
      await docRef.update({
        sentences: sentences,
      });
      console.log('process.env.GCP_PROJECT', process.env.GCP_PROJECT);
      response.redirect(
        `https://asia-northeast1-voice-ii-men-333213.cloudfunctions.net/get-article?id=${id}`
      );
    } else {
      throw new Error('article was not found');
    }
  } catch (error) {
    if (error instanceof Error) {
      const {name, message} = error;
      response.status(500).send({error: {name, message}});
    } else {
      response.status(500);
    }
  }
};
