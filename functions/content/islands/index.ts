import { contentTemplateWithIslands } from "../../../templates/content.ts";

export async function onRequest() {
  return new Response(
    contentTemplateWithIslands({
      base: "/content/islands/",
      title: "Content",
    }),
    {
      status: 200,
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    },
  );
}
