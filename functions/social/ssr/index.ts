import { socialTemplate } from "../../../templates/social.ts";
import type { Ad, Article, User, Trend } from "../../../types.ts";

export async function onRequest({ request: { url } }: { request: Request }) {
  // TODO: As a micro-optimization this could be parallelized with Promise.all
  const adRes = await fetch(`${new URL(url).origin}/social/api/get-ad`);
  const ad: Ad = await adRes.json();
  const topArticlesRes = await fetch(
    `${new URL(url).origin}/social/api/get-top-articles`,
  );
  const topArticles: Article[] = await topArticlesRes.json();
  const contentFeedRes = await fetch(
    `${new URL(url).origin}/social/api/get-content-feed`,
  );
  const contentFeed: Article[] = await contentFeedRes.json();
  const whoToFollowRes = await fetch(
    `${new URL(url).origin}/social/api/get-who-to-follow`,
  );
  const whoToFollow: User[] = await whoToFollowRes.json();
  const topTrendsRes = await fetch(
    `${new URL(url).origin}/social/api/get-top-trends`,
  );
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
