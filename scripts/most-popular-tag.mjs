import fs from "fs-extra";
import commander from 'commander';
import isWithinInterval from 'date-fns/isWithinInterval/index.js';
import addDays from 'date-fns/addDays/index.js';
import parseIso from 'date-fns/parseISO/index.js';
import { articles, createArticle } from "../src/articles.mjs";
import { readme } from "../src/readme.mjs";
import { until, reduce } from "../src/async-generators-helpers.mjs";

async function* tagsWithStatics(articlesIterator = articles()) {
  for await (const article of articlesIterator) {
    yield* article.tag_list.map(tag => [tag, article.positive_reactions_count, article.comments_count]);
  }
}

const toStatisticObject = (acc, [tag, reactions, comments]) => {
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
};

const sortEntriesByKey = (key) => ([, a], [, b]) => a[key] - b[key];
const sortDescEntriesByKey = (key) => ([, a], [, b]) => b[key] - a[key];

const articlesForTemporal = (temporal) => {
  // throw temporal;
  switch (temporal) {
    case 'weekly':
      const today = Date.now();
      return until(articles(), (article) => isWithinInterval(
        parseIso(article.published_at), {
          start: addDays(today, -7),
          end: today,
        }));
    case 'all':
    default:
      return articles();
  }
};

const titlePartsForTemporal = (temporal) => {
  switch (temporal) {
    case 'weekly':
      return `of the last 7 days (${new Date().toDateString()})`;
    case 'all':
    default:
      return 'so far';
  }
};
const main = async ({
                      temporal,
                      numberOfTags = 99,
                      publishArticle = false,
                      output = true,
                    }) => {
  const titlePart = titlePartsForTemporal(temporal);
  const tags = await reduce(
    tagsWithStatics(articlesForTemporal(temporal)),
    toStatisticObject,
    {});

  const tagsAsEntries = Object.entries(tags);
  const mostUsedTags = tagsAsEntries
    .sort(sortDescEntriesByKey('usages'))
    .slice(0, numberOfTags);
  const mostReactedTags = tagsAsEntries
    .sort(sortDescEntriesByKey('reactions'))
    .slice(0, numberOfTags);
  const mostCommentedTags = tagsAsEntries
    .sort(sortDescEntriesByKey('comments'))
    .slice(0, numberOfTags);
  const mostScoredTags = tagsAsEntries
    .sort(sortDescEntriesByKey('score'))
    .slice(0, numberOfTags);

  const mostUsedTagsMD = readme`---
title: The ${numberOfTags} most used Tags ${titlePart}
published: ${publishArticle}
tags: meta, statistics
series: The Most popular Tags
---
# The ${numberOfTags} most used Tags ${titlePart}
${mostUsedTags
    .map(([tag, { usages }], position) => readme`  ${position + 1}. [${tag}](https://dev.to/t/${tag}) used **${usages}** times {% tag ${tag} %}`)}
  `;
  const mostReactedTagsMD = readme`---
title: The ${numberOfTags} most reacted Tags ${titlePart}
published: ${publishArticle}
tags: meta, statistics
series: The Most popular Tags
---

# The ${numberOfTags} most reacted Tags ${titlePart}
${mostReactedTags
    .map(([tag, { reactions }], position) => readme`  ${position + 1}. [${tag}](https://dev.to/t/${tag}) reacted **${reactions}** times {% tag ${tag} %}`)}
  `;

  const mostCommentedTagsMD = readme`---
title: The ${numberOfTags} most commented Tags ${titlePart}
published: ${publishArticle}
tags: meta, statistics
series: The Most popular Tags
---

# The ${numberOfTags} most commented Tags ${titlePart}
${mostCommentedTags
    .map(([tag, { comments }], position) => readme`  ${position + 1}. [${tag}](https://dev.to/t/${tag}) commented **${comments}** times {% tag ${tag} %}`)}
  `;

  const mostScoredTagsMD = readme`---
title: The ${numberOfTags} most popular Tags ${titlePart}
published: ${publishArticle}
tags: meta, statistics
series: The Most popular Tags
---
# The ${numberOfTags} most popular Tags ${titlePart}
${mostScoredTags
    .map(([tag, { score }], position) => readme`  ${position + 1}. [${tag}](https://dev.to/t/${tag}) {% tag ${tag} %}`)}
  `;

  if (output) {
    fs.outputFileSync(`outputs/${temporal}/most-used-tags.md`, mostUsedTagsMD);
    console.info(`created outputs/${temporal}/most-used-tags.md`);

    fs.outputFileSync(`outputs/${temporal}/most-reacted-tags.md`, mostReactedTagsMD);
    console.info(`created outputs/${temporal}/most-reacted-tags.md`);

    fs.outputFileSync(`outputs/${temporal}/most-commented-tags.md`, mostCommentedTagsMD);
    console.info(`created outputs/${temporal}/most-commented-tags.md`);

    fs.outputFileSync(`outputs/${temporal}/most-scored-tags.md`, mostScoredTagsMD);
    console.info(`created outputs/${temporal}/most-scored-tags.md`);
  }

  const logArticleCreated = (article) => console.info(`created ${article.url}`);
  const logArticleError = (type) => (error) => console.info(`error creating most ${type} tags ${error.message}`);
  await Promise.all([
    createArticle({ body_markdown: mostUsedTagsMD })
      .then(logArticleCreated)
      .catch(logArticleError('used')),
    createArticle({ body_markdown: mostReactedTagsMD })
      .then(logArticleCreated)
      .catch(logArticleError('reacted')),
    createArticle({ body_markdown: mostCommentedTagsMD })
      .then(logArticleCreated)
      .catch(logArticleError('commented')),
    createArticle({ body_markdown: mostScoredTagsMD })
      .then(logArticleCreated)
      .catch(logArticleError('scored')),
  ]);
};

commander
  .version('0.0.1')
  .option('-t, --temporal <interval>', 'the temporal interval to use [ weekly | all ]', 'all')
  .option('-n, --number <number-of-tags>', 'the number of tags to show in the output lists, default 99', '99')
  .option('-p, --publish', 'publish to dev-tp', false)
  .option('-p, --no-output', 'disable writing markdown to output')
  .parse(process.argv);

main({
  temporal: commander.temporal,
  numberOfTags: commander.number,
  publishArticle: commander.publish,
  output: commander.output,
})
  .then(() => console.log('finish'))
  .catch((e) => console.error(e));
