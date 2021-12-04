import {HttpFunction} from '@google-cloud/functions-framework';
import {Readability} from '@mozilla/readability';
import axios from 'axios';
import {JSDOM} from 'jsdom';

const fetchArticleFromURL = async (url: string) => {
  const response = await axios.get(url);
  const document = new JSDOM(response.data).window.document;
  return new Readability(document).parse();
};

export const parseArticle: HttpFunction = async (request, response) => {
  try {
    console.log('query', request.query);
    const {url} = request.query;
    if (!url) {
      throw new Error('url in querty is empty');
    }
    if (typeof url === 'string') {
      const article = await fetchArticleFromURL(url);
      if (!article) {
        throw new Error('Failed fetchArticleFromURL');
      }
      response.status(200).send({article: Object.assign(article, {url})});
    } else {
      throw new Error('url in querty is not string type');
    }
  } catch (error) {
    if (error instanceof Error) {
      const {name, message} = error;
      response.status(500).send({error: {name, message}});
    }
  }
};
