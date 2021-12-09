import type {HttpFunction} from '@google-cloud/functions-framework';
const Firestore = require('@google-cloud/firestore');

type ArticleType = {
  id: string;
  title: string;
  texts: string;
  siteName: string;
  url: string;
  audio?: string;
};

const fetchArticles = async (): Promise<ArticleType[]> => {
  const articles: ArticleType[] = [];
  const db = new Firestore({projectId: process.env.GCP_PROJECT});
  const snapshot = await db.collection('articles').get();
  snapshot.forEach(doc => {
    const {id} = doc;
    articles.push(Object.assign({id}, doc.data()));
  });
  return articles;
};

export const getArticles: HttpFunction = async (request, response) => {
  try {
    const articles = await fetchArticles();
    response.status(200).send({articles});
  } catch (error) {
    if (error instanceof Error) {
      response.status(500).send({error: error.message});
    } else {
      response.status(500);
    }
  }
};
