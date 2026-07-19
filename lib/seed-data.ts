import manifest from "@/lib/image-manifest.json";
import type { Category, Product, ProductStock, Settings } from "./types";

export const SEED_CATEGORIES: Omit<Category, "id">[] = [
  { slug: "jeans", name: "Jeans", sort_order: 1 },
  { slug: "polos", name: "Polos Rugby", sort_order: 2 },
  { slug: "hoodies", name: "Hoodies", sort_order: 3 },
  { slug: "remeras", name: "Remeras", sort_order: 4 },
];

export const SEED_PRODUCTS = [
  {
    legacy_id: 1,
    name: "Jean Baggy Celeste",
    category_slug: "jeans",
    price: 2490,
    sizes: ["38", "40", "42", "44"],
    image_key: "jc",
    badge: "Top",
    color_label: "Celeste lavado",
    stock: { "38": 5, "40": 4, "42": 3, "44": 2 },
  },
  {
    legacy_id: 2,
    name: "Jean Baggy Celeste",
    category_slug: "jeans",
    price: 2490,
    sizes: ["38", "40", "42", "44"],
    image_key: "jcs",
    badge: null,
    color_label: "Celeste — vista lateral",
    stock: { "38": 4, "40": 4, "42": 2, "44": 2 },
  },
  {
    legacy_id: 3,
    name: "Jean Baggy Negro",
    category_slug: "jeans",
    price: 2490,
    sizes: ["38", "40", "42", "44"],
    image_key: "jn",
    badge: null,
    color_label: "Negro",
    stock: { "38": 3, "40": 3, "42": 2, "44": 1 },
  },
  {
    legacy_id: 4,
    name: "Jean Baggy Negro",
    category_slug: "jeans",
    price: 2490,
    sizes: ["38", "40", "42", "44"],
    image_key: "jns",
    badge: null,
    color_label: "Negro — vista lateral",
    stock: { "38": 2, "40": 2, "42": 2, "44": 1 },
  },
  {
    legacy_id: 5,
    name: "Jean Baggy Raw",
    category_slug: "jeans",
    price: 2590,
    sizes: ["38", "40", "42", "44"],
    image_key: "jn2",
    badge: "Últimos",
    color_label: "Negro raw",
    stock: { "38": 1, "40": 1, "42": 0, "44": 0 },
  },
  {
    legacy_id: 6,
    name: "Rugby Attitude",
    category_slug: "polos",
    price: 1890,
    sizes: ["S", "M", "L", "XL", "XXL", "XXXL"],
    image_key: "pb",
    badge: "Nuevo",
    color_label: "Bordo / Blanco",
    stock: { S: 3, M: 4, L: 4, XL: 3, XXL: 2, XXXL: 1 },
  },
  {
    legacy_id: 7,
    name: "Rugby Attitude",
    category_slug: "polos",
    price: 1890,
    sizes: ["S", "M", "L", "XL", "XXL", "XXXL"],
    image_key: "pb2",
    badge: null,
    color_label: "Bordo — vista 2",
    stock: { S: 2, M: 3, L: 3, XL: 2, XXL: 2, XXXL: 1 },
  },
  {
    legacy_id: 8,
    name: "Rugby Attitude",
    category_slug: "polos",
    price: 1890,
    sizes: ["S", "M", "L", "XL", "XXL", "XXXL"],
    image_key: "pn",
    badge: null,
    color_label: "Navy / Blanco",
    stock: { S: 3, M: 3, L: 3, XL: 2, XXL: 2, XXXL: 1 },
  },
  {
    legacy_id: 9,
    name: "Rugby Attitude",
    category_slug: "polos",
    price: 1890,
    sizes: ["S", "M", "L", "XL", "XXL", "XXXL"],
    image_key: "pw",
    badge: null,
    color_label: "Blanco / Navy",
    stock: { S: 2, M: 2, L: 2, XL: 2, XXL: 1, XXXL: 1 },
  },
  {
    legacy_id: 10,
    name: "Hoodie Inspired by Money",
    category_slug: "hoodies",
    price: 2190,
    sizes: ["S", "M", "L", "XL", "XXL", "XXXL"],
    image_key: "hd",
    badge: "Top",
    color_label: "Negro / Gris / Marrón",
    stock: { S: 2, M: 3, L: 3, XL: 2, XXL: 1, XXXL: 1 },
  },
  {
    legacy_id: 11,
    name: "Remera Polo Manga Larga",
    category_slug: "remeras",
    price: 990,
    sizes: ["S", "M", "L", "XL", "XXL", "XXXL"],
    image_key: "rm",
    badge: null,
    color_label: "Negro / Blanco",
    stock: { S: 4, M: 4, L: 3, XL: 2, XXL: 2, XXXL: 1 },
  },
] as const;

export const DEFAULT_SETTINGS: Settings = {
  shipping_flat_rate: 300,
  low_stock_threshold: 2,
  whatsapp_number: "59899123456",
  bank_transfer_info:
    "Banco: BROU\nTitular: BRED Indumentaria\nCuenta: XXXXX",
  instagram_handle: "@bred_indumentaria",
  contact_email: "bred.indumentaria@gmail.com",
};

export function getSeedImageUrl(key: string): string {
  const images = manifest as Record<string, string>;
  return images[key] || "/products/placeholder.jpg";
}

export function seedProductToProduct(
  seed: (typeof SEED_PRODUCTS)[number],
  categoryId: string,
  categorySlug: string,
  id?: string
): Product {
  const stock: ProductStock[] = Object.entries(seed.stock).map(
    ([size, quantity]) => ({ size, quantity })
  );

  return {
    id: id || `seed-${seed.legacy_id}`,
    legacy_id: seed.legacy_id,
    name: seed.name,
    category_id: categoryId,
    category_slug: categorySlug,
    color_label: seed.color_label,
    price: seed.price,
    badge: seed.badge,
    image_url: getSeedImageUrl(seed.image_key),
    sizes: [...seed.sizes],
    active: true,
    stock,
  };
}

export function getLocalSeedProducts(): Product[] {
  const categoryMap: Record<string, string> = {
    jeans: "cat-jeans",
    polos: "cat-polos",
    hoodies: "cat-hoodies",
    remeras: "cat-remeras",
  };

  return SEED_PRODUCTS.map((p) =>
    seedProductToProduct(p, categoryMap[p.category_slug], p.category_slug)
  );
}

export function getLocalSeedCategories(): Category[] {
  return SEED_CATEGORIES.map((c, i) => ({
    id: `cat-${c.slug}`,
    ...c,
  }));
}
