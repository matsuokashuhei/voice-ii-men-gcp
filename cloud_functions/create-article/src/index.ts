import {HttpFunction} from '@google-cloud/functions-framework';
const Firestore = require('@google-cloud/firestore');
const crypto = require('crypto');

type ArticleType = {
  url: string;
  title: string;
  byline: string;
  dir: string;
  content: string;
  textContent: string;
  length: number;
  excerpt: string;
  siteName: string;
};

const generateId = (url: string): string => {
  return crypto.createHash('sha256').update(url).digest('hex');
};

const saveArticle = async (
  article: ArticleType
): Promise<string | ArticleType> => {
  const id = generateId(article.url);
  const db = new Firestore({projectId: 'voice-ii-men-333213'});
  const docRef = db.collection('articles').doc(id);
  await docRef.set(article);
  return Object.assign({id}, article);
};

export const createArticle: HttpFunction = async (req, res) => {
  try {
    const {article}: {article: ArticleType} = req.body;
    const saved = await saveArticle(article);
    res.status(201).send({article: saved});
  } catch (error) {
    if (error instanceof Error) {
      const {name, message} = error;
      res.status(500).send({error: {name, message}});
    } else {
      res.status(500);
    }
  }
};
