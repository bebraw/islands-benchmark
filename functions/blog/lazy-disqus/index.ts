import { postIndexTemplate } from "../../../templates/blog.ts";
import type { Post } from "../../../types.ts";

export async function onRequest({ request: { url } }: { request: Request }) {
  const res = await fetch(`${new URL(url).origin}/blog/api/posts`);
  const posts: Post[] = await res.json();

  return new Response(
    postIndexTemplate({
      base: "/blog/lazy-disqus/",
      title: "Posts",
      posts,
    }),
    {
      status: 200,
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    },
  );
}
