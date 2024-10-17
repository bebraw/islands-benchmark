import { adTemplate } from "../../../templates/social.ts";
import { loremIpsum } from "../../../content.ts";
import type { Ad } from "../../../types.ts";

const ad: Ad = {
  id: "test-ad",
  title: loremIpsum(0, 10),
  url: loremIpsum(10, 10),
};

export async function onRequest({ request: { url } }: { request: Request }) {
  const { searchParams } = new URL(url);
  const format = searchParams.get("format");

  if (format === "html") {
    return new Response(adTemplate(ad), {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        // Avoid caching as this can skew results
        // "cache-control": "max-age=3600",
      },
    });
  }

  // Default to JSON
  return new Response(JSON.stringify(ad, null, 2), {
    status: 200,
    headers: {
      "content-type": "application/json",
      // Avoid caching as this can skew results
      // "cache-control": "max-age=3600",
    },
  });
}
