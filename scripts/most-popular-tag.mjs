import * as fs from "fs";
import { articles } from "../src/articles";
import { readme } from "../src/readme";
import { reduce } from "../src/async-generators-helpers";

async function* tagsWithStatics() {
  for await (const article of articles()) {
    yield* article.tag_list.map(tag => [tag, article.positive_reactions_count, article.comments_count]);
  }
}

const sortEntriesByKey = (key) => ([, a], [, b]) => a[key] - b[key];
const sortDescEntriesByKey = (key) => ([, a], [, b]) => b[key] - a[key];
const main = async () => {
  const tags = await reduce(tagsWithStatics(), (acc, [tag, reactions, comments]) => {
    const {
      [tag]: accTag = {
        score: 0,
        reactions: 0,
        comments: 0,
        usages: 0,
      }
    } = acc;
    return ({
      ...acc,
      [tag]: {
        score: accTag.score + 10 + reactions + 1.5 * comments,
        reactions: accTag.reactions + reactions,
        comments: accTag.comments + comments,
        usages: accTag.usages + 1,
      }
    })
  }, {});
  fs.writeFileSync('outputs/tags.json', JSON.stringify(tags));
  console.info('tags successful stored to outputs/tags.json');
  const mostUsedTags = Object.entries(tags)
    .sort(sortDescEntriesByKey('usages'))
    .slice(0, 99);
  fs.writeFileSync('outputs/most-used-tags.md', readme`
# The 99 most used Tags so far
${mostUsedTags
    .map(([tag, {usages}], position) => readme`  ${position + 1}. [${tag}](https://dev.to/t/${tag}) used **${usages}** times`)}
  `);
  const mostReactedTags = Object.entries(tags)
    .sort(sortDescEntriesByKey('reactions'))
    .slice(0, 99);
  fs.writeFileSync('outputs/most-reacted-tags.md', readme`
# The 99 most reacted Tags so far
${mostReactedTags
    .map(([tag, {reactions}], position) => readme`  ${position + 1}. [${tag}](https://dev.to/t/${tag}) reacted **${reactions}** times`)}
  `);
  const mostCommentedTags = Object.entries(tags)
    .sort(sortDescEntriesByKey('comments'))
    .slice(0, 99);
  fs.writeFileSync('outputs/most-commented-tags.md', readme`
# The 99 most commented Tags so far
${mostCommentedTags
    .map(([tag, {comments}], position) => readme`  ${position + 1}. [${tag}](https://dev.to/t/${tag}) commented **${comments}** times`)}
  `);
  const mostScoredTags = Object.entries(tags)
    .sort(sortDescEntriesByKey('score'))
    .slice(0, 99);
  fs.writeFileSync('outputs/most-scored-tags.md', readme`
# The 99 most popular Tags so far
${mostScoredTags
    .map(([tag, {score}], position) => readme`  ${position + 1}. [${tag}](https://dev.to/t/${tag})`)}
  `);
};

main()
  .then(() => console.log('finish'))
  .catch((e) => console.error(e));
