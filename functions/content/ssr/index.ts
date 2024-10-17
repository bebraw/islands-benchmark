import { contentTemplate } from "../../../templates/content.ts";
import type { Article } from "../../../types.ts";

export async function onRequest({ request: { url } }: { request: Request }) {
  const [latestRes, mostReadRes] = await Promise.all([
    fetch(`${new URL(url).origin}/content/api/get-latest`),
    fetch(`${new URL(url).origin}/content/api/get-most-read`),
  ]);
  const latestArticles: Article[] = await latestRes.json();
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
