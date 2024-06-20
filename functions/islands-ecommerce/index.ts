import { productIndexTemplate } from "../../templates/vanilla.ts";
import type { Product } from "../../types.ts";

// TODO: Handle this with islands instead
export async function onRequest({ request: { url } }: { request: Request }) {
  // const res = await fetch(`${new URL(url).origin}/api/posts`);
  const products: Product[] = []; //await res.json();

  return new Response(
    productIndexTemplate({
      base: "/ssr-ecommerce/",
      title: "Products",
      products,
    }),
    {
      status: 200,
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    },
  );
}
