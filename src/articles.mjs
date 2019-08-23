import fetch from "node-fetch2";

export const fetchArticles = async (page = 1) => fetch('https://dev.to/api/articles?page=' + page).then(r => r.json());

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
