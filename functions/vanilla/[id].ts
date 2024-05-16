import { postTemplateWithComments } from "../../templates/vanilla.ts";
import type { Post } from "../../types.ts";

export async function onRequest({
  env,
  params: { id },
  request: { url },
}: {
  env: { COMMENTS: KVNamespace };
  params: { id: string };
  request: Request;
}) {
  const res = await fetch(`${new URL(url).origin}/api/posts`);
  const posts: Post[] = await res.json();
  const foundPost = posts.find((p) => p.id === id);

  if (!foundPost) {
    return new Response(`{ "error": "No matching post was found" }`, {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  return new Response(
    postTemplateWithComments({
      ...foundPost,
      comments: await getComments(env.COMMENTS, id),
      base: "/vanilla/",
    }),
    {
      status: 200,
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    },
  );
}

async function getComments(db: KVNamespace, id: string) {
  try {
    const data = await db.get(id);

    if (data) {
      return JSON.parse(data);
    }
  } catch (_error) {}

  return [];
}
