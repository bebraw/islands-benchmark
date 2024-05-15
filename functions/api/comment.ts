import { nanoid } from "nanoid";

export async function onRequest({
  env,
  request,
}: {
  env: { COMMENTS: KVNamespace };
  request: Request;
}) {
  const { headers } = request;
  const contentType = headers.get("content-type") || "";
  const referer = headers.get("referer");

  if (referer && contentType.includes("form")) {
    const formData = await request.formData();
    const body: Record<string, string> = {};

    // TODO: Add stronger validation here (zod etc.)
    for (const entry of formData.entries()) {
      body[entry[0]] = entry[1] as string;
    }

    const { comment, id } = body;
    let comments = [];

    try {
      const data = await env.COMMENTS.get(id);

      if (data) {
        comments = JSON.parse(data);
      }
    } catch (error) {}

    await env.COMMENTS.put(
      id,
      JSON.stringify(comments.concat({ id: nanoid(), content: comment }))
    );

    return Response.redirect(referer, 301);
  }

  return new Response("Bad Request", { status: 400 });
}
