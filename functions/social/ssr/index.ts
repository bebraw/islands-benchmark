import { socialTemplate } from "../../../templates/social.ts";
import type { Ad, Article, User, Trend } from "../../../types.ts";

export async function onRequest({ request: { url } }: { request: Request }) {
  const [adRes, topArticlesRes, contentFeedRes, whoToFollowRes, topTrendsRes] =
    await Promise.all([
      fetch(`${new URL(url).origin}/social/api/get-ad`),
      fetch(`${new URL(url).origin}/social/api/get-top-articles`),
      fetch(`${new URL(url).origin}/social/api/get-content-feed`),
      fetch(`${new URL(url).origin}/social/api/get-who-to-follow`),
      fetch(`${new URL(url).origin}/social/api/get-top-trends`),
    ]);
  const ad: Ad = await adRes.json();
  const topArticles: Article[] = await topArticlesRes.json();
  const contentFeed: Article[] = await contentFeedRes.json();
  const whoToFollow: User[] = await whoToFollowRes.json();
  const topTrends: Trend[] = await topTrendsRes.json();

  return new Response(
    socialTemplate({
      base: "/social/ssr/",
      title: "Social",
      ad,
      contentFeed,
      topArticles,
      whoToFollow,
      topTrends,
    }),
    {
      status: 200,
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    },
  );
}
