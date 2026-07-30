import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient as createServerClient } from "@/lib/supabase/server";
import {
  DEFAULT_SETTINGS,
  getLocalSeedCategories,
  getLocalSeedProducts,
  getSeedImageUrl,
  SEED_CATEGORIES,
  SEED_PRODUCTS,
} from "@/lib/seed-data";
import type { Category, Product, Settings } from "@/lib/types";

function hasSupabase() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

async function fetchCategories(): Promise<Category[]> {
  if (!hasSupabase()) return getLocalSeedCategories();

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  if (error || !data?.length) return getLocalSeedCategories();
  return data;
}

export const getCategories = unstable_cache(
  fetchCategories,
  ["store-categories"],
  { revalidate: 60 }
);

function mapProductRow(p: {
  id: string;
  legacy_id?: number | null;
  name: string;
  category_id: string;
  categories?: { slug: string } | { slug: string }[] | null;
  color_label: string;
  price: number;
  badge: string | null;
  image_url: string;
  sizes: string[];
  active: boolean;
  product_stock?: { size: string; quantity: number }[];
}): Product {
  const category = Array.isArray(p.categories)
    ? p.categories[0]
    : p.categories;

  return {
    id: p.id,
    legacy_id: p.legacy_id,
    name: p.name,
    category_id: p.category_id,
    category_slug: category?.slug,
    color_label: p.color_label,
    price: p.price,
    badge: p.badge,
    image_url: p.image_url,
    sizes: p.sizes || [],
    active: p.active,
    stock: (p.product_stock || []).map((s) => ({
      size: s.size,
      quantity: s.quantity,
    })),
  };
}

async function fetchProducts(): Promise<Product[]> {
  if (!hasSupabase()) return getLocalSeedProducts();

  const supabase = createPublicClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("*, categories(slug), product_stock(size, quantity)")
    .eq("active", true)
    .order("created_at");

  if (error || !products?.length) return getLocalSeedProducts();

  return products.map(mapProductRow);
}

export const getProducts = unstable_cache(fetchProducts, ["store-products"], {
  revalidate: 60,
});

async function findProductById(id: string): Promise<Product | null> {
  if (!hasSupabase()) {
    return getLocalSeedProducts().find((p) => p.id === id) || null;
  }

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(slug), product_stock(size, quantity)")
    .eq("id", id)
    .eq("active", true)
    .single();

  if (error || !data) {
    return getLocalSeedProducts().find((p) => p.id === id) || null;
  }

  return mapProductRow(data);
}

const getCachedProductById = unstable_cache(
  findProductById,
  ["store-product"],
  { revalidate: 60 }
);

export const getProductById = cache(getCachedProductById);

export function getRelatedProducts(
  product: Product,
  allProducts: Product[],
  limit = 4
): Product[] {
  return allProducts
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.name === product.name || p.category_slug === product.category_slug)
    )
    .slice(0, limit);
}

async function fetchSettings(): Promise<Settings> {
  if (!hasSupabase()) return DEFAULT_SETTINGS;

  const supabase = createPublicClient();
  const { data, error } = await supabase.from("settings").select("*").eq("id", 1).single();

  if (error || !data) return DEFAULT_SETTINGS;
  return {
    shipping_flat_rate: data.shipping_flat_rate,
    low_stock_threshold: data.low_stock_threshold,
    whatsapp_number: data.whatsapp_number,
    bank_transfer_info: data.bank_transfer_info,
    instagram_handle: data.instagram_handle,
    contact_email: data.contact_email,
  };
}

export const getSettings = unstable_cache(fetchSettings, ["store-settings"], {
  revalidate: 60,
});

export async function getAllProductsAdmin(): Promise<Product[]> {
  if (!hasSupabase()) return getLocalSeedProducts();

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(slug), product_stock(size, quantity)")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map(mapProductRow);
}

export async function seedDatabase() {
  const supabase = createAdminClient();

  for (const cat of SEED_CATEGORIES) {
    await supabase.from("categories").upsert(cat, { onConflict: "slug" });
  }

  const { data: categories } = await supabase.from("categories").select("id, slug");
  const catMap = Object.fromEntries((categories || []).map((c) => [c.slug, c.id]));

  for (const product of SEED_PRODUCTS) {
    const image_url = getSeedImageUrl(product.image_key);
    const { data: inserted, error } = await supabase
      .from("products")
      .upsert(
        {
          legacy_id: product.legacy_id,
          name: product.name,
          category_id: catMap[product.category_slug],
          color_label: product.color_label,
          price: product.price,
          badge: product.badge,
          image_url,
          sizes: product.sizes,
          active: true,
        },
        { onConflict: "legacy_id" }
      )
      .select("id")
      .single();

    if (error || !inserted) continue;

    const stockRows = Object.entries(product.stock).map(([size, quantity]) => ({
      product_id: inserted.id,
      size,
      quantity,
    }));

    await supabase.from("product_stock").upsert(stockRows, {
      onConflict: "product_id,size",
    });
  }

  await supabase.from("settings").upsert({ id: 1, ...DEFAULT_SETTINGS });
}
