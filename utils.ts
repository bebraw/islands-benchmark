// Adapted and extracted from https://reego.dev/blog/achieving-isr-on-cloudflare-workers
async function isr(
  request: Request,
  // The assumption here is that PAGE_CACHE is bound to the environment.
  // TODO: This could be extracted as a generic and a parameter to give control
  // to the developer.
  env: { PAGE_CACHE: KVNamespace },
  waitUntil: (promise: Promise<any>) => void,
  headers: HeadersInit,
  render: (request: Request) => Promise<{
    status: number;
    body: string;
  }>
) {
  const url = new URL(request.url);

  // Replace the last slash with empty to normalize foo and foo/ into the same case
  // Remove leading slashes
  // Replace /'s with -'s to avoid
  // "FileStorageError [ERR_NAMESPACE_KEY_CHILD]: Cannot put key"
  const key = url.pathname
    .replace(/\/$/, "")
    .replace(/^\/+/, "")
    .replace(/\//g, "-");

  // Try to serve a static asset from KV
  try {
    const asset = await env.PAGE_CACHE.get(key);
    if (asset) {
      return new Response(asset, { headers });
    }
  } catch (err) {
    // ignore errors and fall back to app rendering
  }

  // Fall back to app rendering
  try {
    // This part is framework-specific.
    // Your favourite framework will render the page
    // based on the request path
    const rendered = await render(request);

    if (rendered) {
      // ISR is achieved here:
      // on successful renders we store the response in KV.
      // Subsequent requests will be served from the store
      if (rendered.status >= 200 && rendered.status < 300) {
        waitUntil(env.PAGE_CACHE.put(key, rendered.body));
      }

      return new Response(rendered.body, {
        status: rendered.status,
        headers,
      });
    }
  } catch (error) {
    return new Response(
      // @ts-expect-error: TS is tricky with errors so keep this simple for now
      "Error rendering route: " + (error.message || error.toString()),
      {
        status: 500,
      }
    );
  }

  return new Response("Not found", {
    status: 404,
  });
}

function range(n: number, customizer = (i: number) => i) {
  return Array.from(Array(n), (_, i) => customizer(i));
}

export { isr, range };
