import {HttpFunction} from '@google-cloud/functions-framework';
import {Readability} from '@mozilla/readability';
import axios from 'axios';
import {JSDOM} from 'jsdom';
const Firestore = require('@google-cloud/firestore');
const crypto = require('crypto');

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

const fetchArticle = async (url: string): Promise<ArticleType> => {
  const response = await axios.get(url);
  const document = new JSDOM(response.data).window.document;
  const article = new Readability(document).parse();
  return Object.assign({url, ...article});
};

const saveArticleToFirestore = async (document: ArticleType) => {
  const id = crypto.createHash('sha256').update(document.url).digest('hex');
  const db = new Firestore({projectId: 'voice-ii-men-333213'});
  const docRef = db.collection('articles').doc(id);
  await docRef.set(document);
  return {id, ...document};
};

export const createArticle: HttpFunction = async (req, res) => {
  try {
    const {url}: {url: string} = req.body;
    const document = await fetchArticle(url);
    const saved = await saveArticleToFirestore(document);
    res.status(201).send({saved});
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).send({error: error.message});
    } else {
      res.status(500);
    }
  }
};
