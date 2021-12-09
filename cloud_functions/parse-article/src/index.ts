import {HttpFunction} from '@google-cloud/functions-framework';
import {Readability} from '@mozilla/readability';
import axios from 'axios';
import {JSDOM} from 'jsdom';

const fetchArticleFromURL = async (url: string) => {
  const response = await axios.get(url);
  const document = new JSDOM(response.data).window.document;
  return new Readability(document).parse();
};

const splitFirstTextAndLastText = (text: string) => {
  if (text.length < 2000) {
    return {firstText: text, lastText: ''};
  }
  const lastIndex = text.slice(0, 2000).lastIndexOf('。') + 1;
  const firstText = text.slice(0, lastIndex);
  const lastText = text.replace(firstText, '');
  return {firstText, lastText};
};

const splitTextBy2000 = (text: string) => {
  const texts: string[] = [];
  let result = splitFirstTextAndLastText(text);
  texts.push(result.firstText);
  while (result.lastText !== '') {
    result = splitFirstTextAndLastText(result.lastText);
    texts.push(result.firstText);
  }
  return texts.map(text => text.replace(/^\n/, '').replace(/\n$/, ''));
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
      const sentences = splitTextBy2000(article.textContent).map(text => {
        return {text};
      });
      const {title, siteName} = article;
      response.status(200).send({article: {url, title, siteName, sentences}});
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
