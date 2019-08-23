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
export function fetchArticles(page?: number): AsyncIterable<Article[]>;
export function articles(page?: number): AsyncIterable<Article[]>;
