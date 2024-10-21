import { baseTemplate } from "../templates/common.ts";

export async function onRequest() {
  return new Response(
    baseTemplate({
      base: "/",
      title: "Islands benchmarks",
      content: `<ul>
  <li><a href="/blog/disqus/">blog - disqus</a></li>
  <li><a href="/blog/islands/">blog - islands</a></li>
  <li><a href="/blog/lazy-disqus/">blog - lazy disqus</a></li>
  <li><a href="/blog/vanilla/">blog - vanilla</a></li>
  <li><a href="/content/islands/">content - islands</a></li>
  <li><a href="/content/ssr/">content - ssr</a></li>
  <li><a href="/ecommerce/islands/">ecommerce - islands</a></li>
  <li><a href="/ecommerce/ssr/">ecommerce - ssr</a></li>
  <li><a href="/social/islands/">social - islands</a></li>
  <li><a href="/social/ssr/">social - ssr</a></li>
</ul>`,
    }),
    {
      status: 200,
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    },
  );
}
