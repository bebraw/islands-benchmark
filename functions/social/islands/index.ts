import { socialTemplateWithIslands } from "../../../templates/social.ts";

export async function onRequest() {
  return new Response(
    socialTemplateWithIslands({
      base: "/social/islands/",
      title: "Social",
    }),
    {
      status: 200,
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    },
  );
}
