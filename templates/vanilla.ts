import type { Comment, Post } from "../types";

function postIndexTemplate({
  base,
  title,
  posts,
}: {
  base: string;
  title: string;
  posts: Post[];
}) {
  return baseTemplate({
    base,
    title,
    content: `<ul>${posts
      .map(({ id, title }) => `<li><a href="./${id}">${title}</a></li>`)
      .join("")}</ul>`,
  });
}

async function postTemplateWithComments({
  id,
  base,
  title,
  comments = [],
}: {
  id: Post["id"];
  base: string;
  title: string;
  comments: Comment[];
}) {
  return baseTemplate({
    base,
    title,
    content: `<div>
    <h2>Comments</h2>
    <ul>${comments.map(({ content }) => `<li><div>${content}</div></li>`)}</ul>
    <form action="/api/comment" method="post">
      <label for="new-comment">Leave a comment</label>
      <input type="hidden" name="id" value="${id}" />
      <textarea id="new-comment" name="comment" rows="4" cols="40" />
      <button type="submit">Send a comment</button>
    </form>
  </div>`,
  });
}

function baseTemplate({
  base,
  title,
  content,
}: {
  base: string;
  title: string;
  content: string;
}) {
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta content="width=device-width, initial-scale=1.0" name="viewport" />
      <base href="${base}" />
      <title>${title}</title>
    </head>
    <body>
      <main>
        <h1>${title}</h1>
        <div>${content}</div>
      </main>
    </body>
  </html>`;
}

export {
  baseTemplate,
  postIndexTemplate,
  baseTemplate as postTemplate,
  postTemplateWithComments,
};
