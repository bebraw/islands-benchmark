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
    content: `<header>Header goes here</header>
<div style="display: flex; flex-direction: row;">
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
    <div>${articleListTemplate(contentFeed)}</div>
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
</div>
<footer>Footer goes here</footer>`,
  });
}

function socialTemplateWithIslands({
  base,
  title,
}: {
  base: string;
  title: string;
}) {
  return baseTemplate({
    base,
    title,
    content: `<header>Header goes here</header>
<div style="display: flex; flex-direction: row;">
  <section style="min-width: 10em;">
    <div>
      <h2>Ad</h2>
      <div id="ad"></div>
    </div>
    <div>
      <h2>Top articles</h2>
      <div id="topArticles"></div>
    </div>
  </section>
  <article>
    <h1>Feed</h1>
    <div id="contentFeed"></div>
  </article>
  <section style="min-width: 10em;">
    <div>
      <h2>Who to follow</h2>
      <div id="whoToFollow"></div>
    </div>
    <div>
      <h2>Top trends</h2>
      <div id="topTrends"></div>
    </div>
  </section>
</div>
<footer>Footer goes here</footer>
<script defer>
requestIdleCallback(async (event) => {
  // It would be possible to prioritize loading of the content feed here for example
  const [adRes, topArticlesRes, contentFeedRes, whoToFollowRes, topTrendsRes] =
    await Promise.all([
      fetch('/social/api/get-ad?format=html'),
      fetch('/social/api/get-top-articles?format=html'),
      fetch('/social/api/get-content-feed?format=html'),
      fetch('/social/api/get-who-to-follow?format=html'),
      fetch('/social/api/get-top-trends?format=html'),
    ]);
  const contentFeed = await contentFeedRes.text();
  document.getElementById('contentFeed').innerHTML = contentFeed;

  const ad = await adRes.text();
  document.getElementById('ad').innerHTML = ad;

  const topArticles = await topArticlesRes.text();
  document.getElementById('topArticles').innerHTML = topArticles;

  const whoToFollow = await whoToFollowRes.text();
  document.getElementById('whoToFollow').innerHTML = whoToFollow;

  const topTrends = await topTrendsRes.text();
  document.getElementById('topTrends').innerHTML = topTrends;
});
</script>`,
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
  socialTemplateWithIslands,
};
