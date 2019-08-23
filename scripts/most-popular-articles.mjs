import * as fs from "fs";
import { waitAll } from "../src/async-generators-helpers.mjs";
import { articles } from "../src/articles.mjs";
import { readme } from "../src/readme.mjs";

const score = article => article.positive_reactions_count + article.comments_count * 1.5;
const main = async () => {
  const allArticles = await waitAll(articles());
  const popularArticles = allArticles.sort((a1, a2) => score(a2) - score(a1)).slice(0, 9);
  fs.writeFileSync('outputs/most-popular-articles.md', readme`
# The 9 most popular Articles so far
${popularArticles
    .map((article, position) => readme`  ${position + 1}. ${article.comments_count} 💬 and ${article.positive_reactions_count} 💕 {% link ${article.url} %}`)}
  `);
};

main()
  .then(() => console.log('finish'))
  .catch((e) => console.error(e));
