import { createClient } from 'https://deno.land/x/foora/mod.ts'
import type { ArticleSummary, ReadArticlesOptions } from 'https://deno.land/x/foora/lib/articles.ts'

const API_KEY = Deno.env.get('DEV_TO_API_KEY');

const client = createClient({
  baseUrl: 'https://dev.to/api',
  secret: API_KEY,
})

export const articles = async function* (
  { page = 1, ...params }: ReadArticlesOptions = { page: 1 },
  parallelRequests = 10,
): AsyncIterable<ArticleSummary> {
  console.info(`current page: ${page}`);
  console.info(`number of parallel requests: ${parallelRequests}`);
  let data;
  for await (data of Array(parallelRequests)
      .fill(0)
      .map((_, i) => client.articles.retrieveAll({ ...params, page: page + i}))) {
    console.info(`successful retrieved ${data.length} articles`);
    yield* data;
  }
  if (data && data.length) yield* articles({ ...params, page: page + parallelRequests }, parallelRequests);
}

export const createArticle = client.articles.create;
