import { contentTemplate } from "../../../templates/content.ts";
import type { Article } from "../../../types.ts";

export async function onRequest({ request: { url } }: { request: Request }) {
  // TODO: As a micro-optimization this could be parallelized with Promise.all
  const latestRes = await fetch(
    `${new URL(url).origin}/content/api/get-latest`,
  );
  const latestArticles: Article[] = await latestRes.json();
  const mostReadRes = await fetch(
    `${new URL(url).origin}/content/api/get-most-read`,
  );
  const mostReadArticles: Article[] = await mostReadRes.json();

  return new Response(
    contentTemplate({
      base: "/content/ssr/",
      title: "Content",
      mostReadArticles,
      latestArticles,
    }),
    {
      status: 200,
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    },
  );
}
