import { AsyncStream } from '../src/async-generators-helpers.ts';
import { articles, ArticleSummary, createArticle } from '../src/articles.ts';
import { readme } from "../src/readme.ts";

const score = (article: ArticleSummary) => article.positive_reactions_count + article.comments_count * 1.5;
const byScore = (a1: ArticleSummary, a2: ArticleSummary) => score(a2) - score(a1)
const afterDate = (date: Date) => (article: ArticleSummary) => Date.parse(article.published_timestamp) >= date.valueOf();

const today = () => {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
}
const main = async () => {
  const allArticles = await AsyncStream.of(articles({ page: 1, top: 1}, 1)).collect();
  const popularArticles = allArticles.sort(byScore).slice(0, 9);
  const title = `The 9 most popular Articles sof today (${today()})`;
  const content = readme`
# ${title}
${popularArticles
    .map((article, position) => readme`  ${position + 1}. ${article.comments_count} 💬 and ${article.positive_reactions_count} 💕 {% link ${article.url} %}`)}
  `;
  return createArticle({
    title,
    body_markdown: content,
    tags: ["misc", "top-articles"],
    published: true
  }).then((article) => {
    console.log('successfully created article');
    console.table(article, Object.keys(article))
  })
};

main()
  .then(() => console.log('finish'))
  .catch((e) => console.error(e));
