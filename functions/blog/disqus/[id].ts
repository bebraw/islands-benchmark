import { postTemplateWithDisqus } from "../../../templates/blog.ts";
import type { Post } from "../../../types.ts";

export async function onRequest({
  env,
  params: { id },
  request: { url },
}: {
  env: { COMMENTS: KVNamespace };
  params: { id: string };
  request: Request;
}) {
  const res = await fetch(`${new URL(url).origin}/blog/api/posts`);
  const posts: Post[] = await res.json();
  const foundPost = posts.find((p) => p.id === id);

  if (!foundPost) {
    return new Response(`{ "error": "No matching post was found" }`, {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  return new Response(
    postTemplateWithDisqus({
      ...foundPost,
      base: "/blog/disqus/",
    }),
    {
      status: 200,
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    },
  );
}
