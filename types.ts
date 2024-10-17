export type Ad {
  id: string;
  title: string;
  url: string;
}

export type Article = {
  id: string;
  category: string;
  title: string;
  slug: string;
};

export type Comment = {
  id: string;
  content: string;
};

export type Post = {
  id: string;
  title: string;
  content: string;
};

export type Product = {
  id: string;
  title: string;
  content: string;
  price: number;
};

export type Trend = {
  id: string;
  title: string;
  slug: string;
};

export type User = {
  id: string;
  name: string;
  slug: string;
};
