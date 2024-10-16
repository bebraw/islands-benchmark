import { loremIpsum } from "../content.ts";
import type { Article } from "../types.ts";
import { baseTemplate } from "./common.ts";

function contentTemplate({
  base,
  title,
  mostReadArticles,
  latestArticles,
}: {
  base: string;
  title: string;
  mostReadArticles: Article[];
  latestArticles: Article[];
}) {
  return baseTemplate({
    base,
    title,
    content: `<div style="display: flex; flex-direction: row;">
  <article>
    <h1>Article title goes here</h1>
    <p>${loremIpsum(0, 1000)}</p>
  </article>
  <section style="min-width: 15em;">
    <div>
      <h2>Most read articles</h2>
      <div>${articleListTemplate(mostReadArticles)}</div>
    </div>
    <div>
      <h2>Latest articles</h2>
      <div>${articleListTemplate(latestArticles)}</div>
    </div>
  </section>
</div>`,
  });
}

function contentTemplateWithIslands({
  base,
  title,
}: {
  base: string;
  title: string;
}) {
  // TODO: Start loading most read and latest articles only on DOM ready
  // and inject them then
  return baseTemplate({
    base,
    title,
    content: `<div style="display: flex; flex-direction: row;">
  <article>
    <h1>Article title goes here</h1>
    <p>${loremIpsum(0, 1000)}</p>
  </article>
  <section style="min-width: 15em;">
    <div>
      <h2>Most read articles</h2>
      <div id="mostReadArticles"></div>
    </div>
    <div>
      <h2>Latest articles</h2>
      <div id="latestArticles"></div>
    </div>
  </section>
</div>
<script defer>
requestIdleCallback(async (event) => {
  await Promise.all([
    load('/content/api/get-latest?format=html', 'latestArticles'),
    load('/content/api/get-most-read?format=html', 'mostReadArticles'),
  ]);

  async function load(url, id) {
    const res = await fetch(url);
    document.getElementById(id).innerHTML = await res.text();
  }
});
</script>`,
  });
}

function articleListTemplate(articles: Article[]) {
  return `<ul>${articles
    .map(
      ({ category, title, slug }) =>
        `<li><span>${category}</span><a href="${slug}">${title}</a></li>`,
    )
    .join("")}</ul>`;
}

export { contentTemplate, contentTemplateWithIslands, articleListTemplate };
