// TODO: Get comments based on id and render through the right template
export function onRequest() {
  // It seems this can be fairly heavy operation. In a real environment,
  // it might be best to ISR this so it's cached after initial generation pass.
  return new Response("foobar", {
    status: 200,
    headers: {
      "cache-control": "max-age=3600",
    },
  });
}
