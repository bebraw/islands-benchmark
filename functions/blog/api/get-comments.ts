import { commentsSection } from "../../../templates/blog.ts";
import { getComments } from "../../../utils.ts";
import type { Post } from "../../../types.ts";

export async function onRequest({
  env,
  request: { url },
}: {
  env: { COMMENTS: KVNamespace };
  request: Request;
}) {
  const { searchParams } = new URL(url);
  const id = searchParams.get("id");

  const res = await fetch(`${new URL(url).origin}/blog/api/posts`);
  const posts: Post[] = await res.json();
  const foundPost = posts.find((p) => p.id === id);

  if (!foundPost || id === null) {
    return new Response(`{ "error": "No matching post was found" }`, {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  return new Response(
    commentsSection({
      id,
      comments: await getComments(env.COMMENTS, id),
    }),
    {
      status: 200,
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    },
  );
}
