import { getPosts } from "../../content";

export function onRequest() {
  // It seems this can be fairly heavy operation. In a real environment,
  // it might be best to ISR this so it's cached after initial generation pass.
  return new Response(JSON.stringify(getPosts(), null, 2), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "max-age=3600",
    },
  });
}
