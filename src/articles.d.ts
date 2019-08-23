export interface User {
  name: string;
  username: string;
  twitter_username: string;
  github_username: string;
  website_url: string;
  profile_image: string;
  profile_image_90: string;
}

export interface Article {
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
  created_at: Date;
  edited_at?: any;
  crossposted_at?: any;
  published_at: Date;
  last_comment_at: Date;
  body_html: string;
  body_markdown: string;
  user: User;
}

export interface ArticleSummary {
  type_of: string;
  id: number;
  title: string;
  description: string;
  cover_image: string;
  published_at: Date;
  tag_list: string[];
  slug: string;
  path: string;
  url: string;
  canonical_url: string;
  comments_count: number;
  positive_reactions_count: number;
  published_timestamp: Date;
  user: User;
}

export function fetchArticles(page?: number): Promise<ArticleSummary[]>;
export function articles(page?: number): AsyncIterable<ArticleSummary[]>;

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

export function createArticle(data: CreateArticleData): Promise<Article>;
