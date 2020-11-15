import { format } from 'https://deno.land/std/datetime/mod.ts';
import { AsyncStream } from '../src/async-generators-helpers.ts';
import { articles, ArticleSummary, createArticle } from '../src/articles.ts';
import { readme } from "../src/readme.ts";

const score = (article: ArticleSummary) => article.positive_reactions_count + article.comments_count * 1.5;
const byScore = (a1: ArticleSummary, a2: ArticleSummary) => score(a2) - score(a1)
const toArticlePositionLine = (article: ArticleSummary, position: number) => readme`  ${position + 1}. ${article.comments_count} 💬 and ${article.positive_reactions_count} 💕 {% link ${article.url} %}`
const disclaimer = readme`
Automated with [alfredosalzillo/my-dev-to](https://github.com/alfredosalzillo/my-dev-to)

{% github alfredosalzillo/my-dev-to %}
`
const elaboratedDay = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1)
  return format(date, 'yyyy-MM-dd');
}
const main = async () => {
  console.log("using env DEV_TO_PUBLISHED", Deno.env.get('DEV_TO_PUBLISHED'))
  const published = Deno.env.get('DEV_TO_PUBLISHED') === 'true';
  const allArticles = await AsyncStream.of(articles({ page: 1, top: 1 }, 1)).collect();
  const totalOfArticles = allArticles.length;
  const totalComments = allArticles.map((article) => article.comments_count).reduce((a, b) => a + b, 0);
  const totalReactions = allArticles.map((article) => article.positive_reactions_count).reduce((a, b) => a + b, 0);
  const popularArticles = allArticles.sort(byScore).slice(0, 9);
  const day = elaboratedDay();
  const title = `The 9 most popular Articles of today (${day})`;
  const description = `Another day, another list of popular tags (edition of ${day}).`;
  const content = readme`
# ${title}
${description}

Based on ${totalOfArticles} articles with ${totalComments} 💬 and ${totalReactions} 💕.

${popularArticles.map(toArticlePositionLine)} 
---
${disclaimer}
  `;
  return createArticle({
    title,
    description,
    body_markdown: content,
    tags: ["misc", "statistics", "meta"],
    main_image: "https://raw.githubusercontent.com/alfredosalzillo/my-dev-to/master/images/awards-accolades-banner.jpg",
    published,
  }).then((article) => {
    console.log('successfully created article ', article.canonical_url);
    return Deno.writeTextFile('./most-popular-articles.md', content)
  })
};

main()
  .then(() => console.log('finish'))
  .catch((e) => console.error(e));
