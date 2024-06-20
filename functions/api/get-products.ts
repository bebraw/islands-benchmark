import { productsTemplate } from "../../templates/vanilla.ts";
import type { Product } from "../../types.ts";

const products: Product[] = [
  {
    id: "123",
    title: "Porsche",
    content: "A car",
    price: 1000,
  },
  {
    id: "1234",
    title: "Audi",
    content: "A car",
    price: 4000,
  },
  {
    id: "12345",
    title: "Ferrari",
    content: "A car",
    price: 10000,
  },
  {
    id: "123456",
    title: "BMW",
    content: "A car",
    price: 500,
  },
  {
    id: "321",
    title: "Ford",
    content: "A car",
    price: 700,
  },
  {
    id: "444",
    title: "Peugeot",
    content: "A car",
    price: 400,
  },
  {
    id: "333",
    title: "Toyota",
    content: "A car",
    price: 900,
  },
  {
    id: "888",
    title: "Mitsubishi",
    content: "A car",
    price: 300,
  },
];

export async function onRequest({ request: { url } }: { request: Request }) {
  const { searchParams } = new URL(url);
  const search = searchParams.get("search");
  const format = searchParams.get("format");

  let foundProducts = products;
  if (search && search !== "null") {
    foundProducts = products.filter((p) =>
      p.title.toLowerCase().startsWith(search),
    );
  }

  if (format === "html") {
    return new Response(productsTemplate(foundProducts), {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "max-age=3600",
      },
    });
  }

  // Default to JSON
  return new Response(JSON.stringify(foundProducts, null, 2), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "max-age=3600",
    },
  });
}
