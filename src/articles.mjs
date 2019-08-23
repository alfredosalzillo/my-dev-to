import fetch from "node-fetch2";

const API_KEY = process.env.DEV_TO_API_KEY;

export const fetchArticles = async (page = 1) => fetch('https://dev.to/api/articles?page=' + page)
  .then(r => r.json());

export async function* articles(page = 1, parallelRequests = 10) {
  console.info(`current page: ${page}`);
  console.info(`number of parallel requests: ${parallelRequests}`);
  let data;
  for await (data of Array(parallelRequests).fill(0).map((_, i) => fetchArticles(page + i))) {
    console.info(`successful retrieved ${data.length} articles`);
    yield* data;
  }
  if (data && data.length) yield* articles(page + parallelRequests, parallelRequests);
}

export const createArticle = async ({
  title,
  body_markdown,
  published = false,
  series,
  main_image,
  canonical_url,
  description,
  organization_id,
  tags,
}) => fetch('https://dev.to/api/articles', {
  method: 'POST',
  headers: {
    "Api-Key": API_KEY,
    "Content-Type": 'application/json',
  },
  body: {
    article: {
      title,
      body_markdown,
      published,
      series,
      main_image,
      canonical_url,
      description,
      organization_id,
      tags,
    },
  },
}).then(r => r.json());
