import { articleListTemplate } from "../../../templates/social.ts";
import { range } from "../../../math.ts";
import { loremIpsum } from "../../../content.ts";
import type { Article } from "../../../types.ts";

const seed = 500;
const content: Article[] = range(10).map((i) => ({
  id: i.toString(),
  category: loremIpsum(seed + i, 20),
  title: loremIpsum(seed + 10 + i, 20),
  slug: loremIpsum(seed + 20 + i, 20),
}));

export async function onRequest({ request: { url } }: { request: Request }) {
  const { searchParams } = new URL(url);
  const format = searchParams.get("format");

  if (format === "html") {
    return new Response(articleListTemplate(content), {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        // Avoid caching as this can skew results
        // "cache-control": "max-age=3600",
      },
    });
  }

  // Default to JSON
  return new Response(JSON.stringify(content, null, 2), {
    status: 200,
    headers: {
      "content-type": "application/json",
      // Avoid caching as this can skew results
      // "cache-control": "max-age=3600",
    },
  });
}
