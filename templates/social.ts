import type { Ad, Article, Trend, User } from "../types.ts";
import { baseTemplate } from "./common.ts";

function socialTemplate({
  base,
  title,
  ad,
  contentFeed,
  topArticles,
  whoToFollow,
  topTrends,
}: {
  base: string;
  title: string;
  ad: Ad;
  contentFeed: Article[];
  topArticles: Article[];
  whoToFollow: User[];
  topTrends: Trend[];
}) {
  return baseTemplate({
    base,
    title,
    content: `<div style="display: flex; flex-direction: row;">
  <section style="min-width: 10em;">
    <div>
      <h2>Ad</h2>
      <div>${adTemplate(ad)}</div>
    </div>
    <div>
      <h2>Top articles</h2>
      <div>${articleListTemplate(topArticles)}</div>
    </div>
  </section>
  <article>
    <h1>Feed</h1>
    <p>${articleListTemplate(contentFeed)}</p>
  </article>
  <section style="min-width: 10em;">
    <div>
      <h2>Who to follow</h2>
      <div>${userListTemplate(whoToFollow)}</div>
    </div>
    <div>
      <h2>Top trends</h2>
      <div>${trendListTemplate(topTrends)}</div>
    </div>
  </section>
</div>`,
  });
}

function adTemplate(ad: Ad) {
  return `<a href="${ad.url}">${ad.title}</a>`;
}

function articleListTemplate(articles: Article[]) {
  return `<ul>${articles
    .map(
      ({ category, title, slug }) =>
        `<li><span>${category}</span><a href="${slug}">${title}</a></li>`,
    )
    .join("")}</ul>`;
}

function trendListTemplate(trends: Trend[]) {
  return `<ul>${trends
    .map(({ title, slug }) => `<li><a href="${slug}">${title}</a></li>`)
    .join("")}</ul>`;
}

function userListTemplate(users: User[]) {
  return `<ul>${users
    .map(({ name, slug }) => `<li><a href="${slug}">${name}</a></li>`)
    .join("")}</ul>`;
}

export {
  adTemplate,
  articleListTemplate,
  trendListTemplate,
  userListTemplate,
  socialTemplate,
};
