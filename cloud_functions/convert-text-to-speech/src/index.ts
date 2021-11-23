import type {HttpFunction} from '@google-cloud/functions-framework/build/src/functions';
import {Storage} from '@google-cloud/storage';
import textToSpeech, {protos} from '@google-cloud/text-to-speech';

export const convertTextToSpeech: HttpFunction = async (req, res) => {
  const callSynthesizeSpeech = (text: string) => {
    console.log('text', text);
    const client = new textToSpeech.TextToSpeechClient({
      projectId: 'voice-ii-men-dev-332908',
    });
    const request = {
      input: {text: text},
      voice: {
        languageCode: 'ja-JP',
        ssmlGender: protos.google.cloud.texttospeech.v1.SsmlVoiceGender.NEUTRAL,
      },
      audioConfig: {
        audioEncoding: protos.google.cloud.texttospeech.v1.AudioEncoding.MP3,
      },
    };
    return client.synthesizeSpeech(request);
  };

  const putToBucket = (audioContent: Uint8Array) => {
    console.log('audioContent', audioContent);
    const storage = new Storage();
    const bucket = storage.bucket('voice-ii-men-dev-332908-text-to-speech');
    const file = bucket.file('test.mp3');
    const buffer = audioContent.buffer;
    return file.save(Buffer.from(buffer), {
      metadata: {
        contentType: 'audio/mpeg',
        metadata: {source: 'text-to-speech'},
      },
    });
  };

  try {
    const [response] = await callSynthesizeSpeech(req.body.text);
    const audioContext = response.audioContent;
    if (audioContext instanceof Uint8Array) {
      await putToBucket(audioContext);
      res.status(201).send({message: 'succeeded'});
    } else {
      res.status(204).send({message: 'audioContext is not Uint8Array'});
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({error});
  }
};
