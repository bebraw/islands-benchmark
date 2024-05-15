import { postIndexTemplate } from "../../../templates/vanilla";
import type { Post } from "../../../types";

export async function onRequest({ request: { url } }: { request: Request }) {
  const res = await fetch(`${new URL(url).origin}/api/posts`);
  const posts = await res.json<Post[]>();

  // Wait 100ms to simulate load
  await new Promise((r) => setTimeout(r, 100));

  return new Response(
    await postIndexTemplate({
      base: "/edge/posts/",
      title: "Posts",
      posts,
    }),
    {
      status: 200,
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    }
  );
}
