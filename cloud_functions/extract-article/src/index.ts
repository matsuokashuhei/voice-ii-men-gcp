import type {HttpFunction} from '@google-cloud/functions-framework/build/src/functions';
import {Readability} from '@mozilla/readability';
import axios, {AxiosResponse} from 'axios';
import {JSDOM} from 'jsdom';

export const extractArticle: HttpFunction = async (req, res) => {
  const getDocument = async (url: string): Promise<Document> => {
    const response: AxiosResponse = await axios.get(url);
    return new Promise((resolve, _) => {
      resolve(new JSDOM(response.data).window.document);
    });
  };

  const document = await getDocument(req.body.url);
  const reader = new Readability(document);
  const article = reader.parse();
  if (article) {
    res.status(200).send(article);
  } else {
    res.status(404);
  }
};
