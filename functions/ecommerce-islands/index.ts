import { productIndexTemplateWithIsland } from "../../templates/vanilla.ts";
import type { Product } from "../../types.ts";

export async function onRequest({ request: { url } }: { request: Request }) {
  const { searchParams } = new URL(url);
  const search = searchParams.get("search") || "";
  const res = await fetch(
    `${new URL(url).origin}/api/get-products?search=${search}`,
  );
  const products: Product[] = await res.json();

  return new Response(
    productIndexTemplateWithIsland({
      base: "/ecommerce-islands/",
      title: "Products",
      products,
      search,
    }),
    {
      status: 200,
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    },
  );
}
