const API_KEY = Deno.env.get('DEV_TO_API_KEY');

export type User = {
  name: string;
  username: string;
  twitter_username: string;
  github_username: string;
  website_url: string;
  profile_image: string;
  profile_image_90: string;
}

export type Article = {
  type_of: string;
  id: number;
  title: string;
  description: string;
  cover_image: string;
  readable_publish_date: string;
  social_image: string;
  tag_list: string;
  tags: string[];
  slug: string;
  path: string;
  url: string;
  canonical_url: string;
  comments_count: number;
  positive_reactions_count: number;
  created_at: string;
  edited_at?: any;
  crossposted_at?: any;
  published_at: string;
  last_comment_at: string;
  body_html: string;
  body_markdown: string;
  user: User;
}

export type ArticleSummary = {
  type_of: string;
  id: number;
  title: string;
  description: string;
  cover_image: string;
  published_at: string;
  tag_list: string[];
  slug: string;
  path: string;
  url: string;
  canonical_url: string;
  comments_count: number;
  positive_reactions_count: number;
  published_timestamp: string;
  user: User;
}

export interface CreateArticleData {
  title?: string;
  body_markdown: string;
  published?: boolean;
  series?: string;
  main_image?: string;
  canonical_url?: string;
  description?: string;
  organization_id?: number;
  tags?: string[];
}

type FetchArticlesParams = {
  page?: number,
  top?: number
}
type FetchArticles = (params: FetchArticlesParams) => Promise<ArticleSummary[]>;
type ArticlesGenerator = (params?: FetchArticlesParams, parallelRequests?: number)=> AsyncIterable<ArticleSummary>;
type CreateArticle = (data: CreateArticleData) => Promise<Article>;

const toQueryParams = (data: any) => Object.entries(data).map((entry) => entry.join("=")).join("&")
export const fetchArticles: FetchArticles = async (params = { page: 1}) => fetch(`https://dev.to/api/articles?${toQueryParams(params)}`)
  .then(r => r.json());

export const articles: ArticlesGenerator = async function* ({ page = 1, ...params } = { page: 1 }, parallelRequests = 10) {
  console.info(`current page: ${page}`);
  console.info(`number of parallel requests: ${parallelRequests}`);
  let data;
  for await (data of Array(parallelRequests).fill(0).map((_, i) => fetchArticles({ ...params, page: page + i}))) {
    console.info(`successful retrieved ${data.length} articles`);
    yield* data;
  }
  if (data && data.length) yield* articles({ ...params, page: page + parallelRequests }, parallelRequests);
}

export const createArticle: CreateArticle = async ({
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
    "Api-Key": API_KEY as string,
    "Content-Type": 'application/json',
  },
  body: JSON.stringify({
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
  }),
}).then(r => r.json());
