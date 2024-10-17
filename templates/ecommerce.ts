import { loremIpsum } from "../content.ts";
import type { Product } from "../types.ts";
import { baseTemplate } from "./common.ts";

function productIndexTemplate({
  base,
  title,
  products,
  search,
}: {
  base: string;
  title: string;
  products: Product[];
  search: string | null;
}) {
  return baseTemplate({
    base,
    title,
    content: `<form action="${base}" method="get">
    <input name="search" value="${search}" />
    <input type="submit" value="Search" />
</form>
<div>${productsTemplate(products)}</div>`,
  });
}

function productIndexTemplateWithIsland({
  base,
  title,
  products,
  search,
}: {
  base: string;
  title: string;
  products: Product[];
  search: string | null;
}) {
  return baseTemplate({
    base,
    title,
    content: `<script>
    async function fetchProducts(event) {
      const search = event.target.elements.search.value;

      // Update browser query without a refresh
      const url = new URL(window.location);
      url.searchParams.set('search', search);
      window.history.pushState({}, '', url);

      // Fetch products
      const products = await (await fetch('/ecommerce/api/get-products?format=html&search=' + search)).text();

      // Update HTML
      document.getElementById('products').innerHTML = products;
    }
  </script>
  <form action="${base}" method="get" onsubmit="fetchProducts(event); return false;">
    <input name="search" value="${search}" />
    <input type="submit" value="Search" />
  </form>
<div id="products">${productsTemplate(products)}</div>`,
  });
}

function productsTemplate(products: Product[]) {
  return `<ul>${products
    .map(
      ({ id, title, price }) => `<li>${title} - (id: ${id}), ${price} €</li>`,
    )
    .join("")}</ul>
    <div>${loremIpsum(0, 10000)}</div>`;
}

export {
  productIndexTemplate,
  productIndexTemplateWithIsland,
  productsTemplate,
};
