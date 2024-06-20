import type { Comment, Post, Product } from "../types.ts";

function productIndexTemplate({
  base,
  title,
  products,
  search,
}: {
  base: string;
  title: string;
  products: Product[];
  search: string | null;
}) {
  return baseTemplate({
    base,
    title,
    content: `<form action="${base}" method="get">
    <input name="search" value="${search}" />
    <input type="submit" value="Search" />
</form>
<div>${productsTemplate(products)}</div>`,
  });
}

function productIndexTemplateWithIsland({
  base,
  title,
  products,
  search,
}: {
  base: string;
  title: string;
  products: Product[];
  search: string | null;
}) {
  return baseTemplate({
    base,
    title,
    content: `<script>
    async function fetchProducts(search) {
      const products = await (await fetch('/api/get-products?html&search=' + search)).text();

      document.getElementById('products').innerHTML = products;
    }
  </script>
  <form action="${base}" method="get">
    <input name="search" value="${search}" />
    <input type="submit" value="Search" />
  </form>
<div id="products">${productsTemplate(products)}</div>`,
  });
}

function productsTemplate(products: Product[]) {
  return `<ul>${products
    .map(
      ({ id, title, price }) =>
        `<li><a href="./${id}">${title}</a><p>${price} €</p></li>`,
    )
    .join("")}</ul>`;
}

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

function postTemplateWithComments({
  id,
  base,
  title,
  content,
  comments = [],
}: {
  id: Post["id"];
  base: string;
  title: string;
  content: string;
  comments: Comment[];
}) {
  return baseTemplate({
    base,
    title,
    content: `${content}${commentsSection({ id, comments })}`,
  });
}

function postTemplateWithCommentsIsland({
  id,
  base,
  title,
  content,
}: {
  id: Post["id"];
  base: string;
  title: string;
  content: string;
}) {
  return baseTemplate({
    base,
    title,
    content: `${content}<div>
    <script>
    async function fetchComments() {
      const comments = await (await fetch('/api/get-comments?id=${id}')).text();

      document.getElementById('comments').innerHTML = comments;
    }
    </script>
    <button onclick="fetchComments()">Show comments</button>
    <div id="comments"></div>
  </div>`,
  });
}

function commentsSection({
  comments,
  id,
}: {
  comments: Comment[];
  id: Post["id"];
}) {
  return `<section>
    <h2>Comments</h2>
    <ul>${comments.map(({ content }) => `<li><div>${sanitizeHTML(content)}</div></li>`).join("")}</ul>
    <form action="/api/comment" method="post">
      <label for="new-comment">Leave a comment</label>
      <input type="hidden" name="id" value="${id}" />
      <textarea id="new-comment" name="comment" rows="4" cols="40"></textarea>
      <button type="submit">Send a comment</button>
    </form>
  </section>`;
}

// MIT: https://github.com/antoinefink/simple-static-comments/blob/master/index.js
function sanitizeHTML(string: string) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };
  const reg = /[&<>"'/]/gi;
  return string.replace(
    reg,
    (match) =>
      // @ts-expect-error This is fine
      map[match],
  );
}

function postTemplateWithDisqus({
  base,
  title,
  content,
}: {
  base: string;
  title: string;
  content: string;
}) {
  return baseTemplate({
    base,
    title,
    content: `${content}${disqusScript()}`,
  });
}

function postTemplateWithLazyDisqus({
  base,
  title,
  content,
}: {
  base: string;
  title: string;
  content: string;
}) {
  return baseTemplate({
    base,
    title,
    content: `${content}
    <div>
      <button onclick="document.getElementById('disqus_script').src = 'https://comments-benchmark.disqus.com/embed.js'">Show comments</button>
      ${lazyDisqusScript()}
    </div>`,
  });
}

function lazyDisqusScript() {
  return `<div id="disqus_thread"></div>
  <script id="disqus_script"></script>
  <noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript">comments powered by Disqus.</a></noscript>`;
}

function disqusScript() {
  return `<div id="disqus_thread"></div>
  <script>
      /**
      *  RECOMMENDED CONFIGURATION VARIABLES: EDIT AND UNCOMMENT THE SECTION BELOW TO INSERT DYNAMIC VALUES FROM YOUR PLATFORM OR CMS.
      *  LEARN WHY DEFINING THESE VARIABLES IS IMPORTANT: https://disqus.com/admin/universalcode/#configuration-variables    */
      /*
      var disqus_config = function () {
      this.page.url = PAGE_URL;  // Replace PAGE_URL with your page's canonical URL variable
      this.page.identifier = PAGE_IDENTIFIER; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
      };
      */
      (function() { // DON'T EDIT BELOW THIS LINE
      var d = document, s = d.createElement('script');
      s.src = 'https://comments-benchmark.disqus.com/embed.js';
      s.setAttribute('data-timestamp', +new Date());
      (d.head || d.body).appendChild(s);
      })();
  </script>
  <noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript">comments powered by Disqus.</a></noscript>`;
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
      <main style="margin: 0 auto 0 auto; max-width: 80ch;">
        <h1>${title}</h1>
        <p>${content}</p>
      </main>
    </body>
  </html>`;
}

export {
  baseTemplate,
  commentsSection,
  postIndexTemplate,
  baseTemplate as postTemplate,
  postTemplateWithComments,
  postTemplateWithCommentsIsland,
  postTemplateWithDisqus,
  postTemplateWithLazyDisqus,
  productIndexTemplate,
  productIndexTemplateWithIsland,
  productsTemplate,
};
