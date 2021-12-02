import type {HttpFunction} from '@google-cloud/functions-framework/build/src/functions';
const Firestore = require('@google-cloud/firestore');

type ArticleType = {
  title: string;
  byline: string;
  dir: string;
  content: string;
  textContent: string;
  length: number;
  excerpt: string;
  siteName: string;
  url: string;
};

const fetchArticles = async () => {
  const articles: ArticleType[] = [];
  const db = new Firestore({projectId: 'voice-ii-men-333213'});
  const snapshot = await db.collection('articles').get();
  snapshot.forEach(doc => {
    const {id} = doc;
    articles.push(Object.assign({id}, doc.data()));
  });
  return articles;
};

export const getArticles: HttpFunction = async (req, res) => {
  try {
    const articles = await fetchArticles();
    res.status(200).send({articles});
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).send({error: error.message});
    } else {
      res.status(500);
    }
  }
};
