import type {HttpFunction} from '@google-cloud/functions-framework';
const Firestore = require('@google-cloud/firestore');

type ArticleType = {
  id: string;
  title: string;
  texts: string[];
  siteName: string;
  url: string;
  audio?: string;
  audioURL?: string;
};

const fetchArticle = async (id: string): Promise<ArticleType> => {
  const db = new Firestore({projectId: process.env.GCP_PROJECT});
  const docRef = await db.collection('articles').doc(id);
  const data = await (await docRef.get()).data();
  return Object.assign({id}, data);
};

export const getArticle: HttpFunction = async (request, response) => {
  try {
    const {id} = request.query;
    if (!id) {
      throw new Error('id is empty');
    }
    if (typeof id === 'string') {
      const article = await fetchArticle(id);
      response.status(200).send({article});
    } else {
      throw new Error('id is not string');
    }
  } catch (error) {
    if (error instanceof Error) {
      response.status(500).send({error: error.message});
    } else {
      response.status(500);
    }
  }
};
