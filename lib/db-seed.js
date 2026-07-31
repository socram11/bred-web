const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const manifest = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../lib/image-manifest.json"), "utf8")
);

const SEED_CATEGORIES = [
  { slug: "jeans", name: "Jeans", sort_order: 1 },
  { slug: "polos", name: "Polos Rugby", sort_order: 2 },
  { slug: "hoodies", name: "Hoodies", sort_order: 3 },
  { slug: "remeras", name: "Remeras", sort_order: 4 },
];

const SEED_PRODUCTS = [
  { legacy_id: 1, name: "Jean Baggy Celeste", category_slug: "jeans", price: 2490, sizes: ["38", "40", "42", "44"], image_key: "jc", badge: "Top", color_label: "Celeste lavado", stock: { "38": 5, "40": 4, "42": 3, "44": 2 } },
  { legacy_id: 2, name: "Jean Baggy Celeste", category_slug: "jeans", price: 2490, sizes: ["38", "40", "42", "44"], image_key: "jcs", badge: null, color_label: "Celeste — vista lateral", stock: { "38": 4, "40": 4, "42": 2, "44": 2 } },
  { legacy_id: 3, name: "Jean Baggy Negro", category_slug: "jeans", price: 2490, sizes: ["38", "40", "42", "44"], image_key: "jn", badge: null, color_label: "Negro", stock: { "38": 3, "40": 3, "42": 2, "44": 1 } },
  { legacy_id: 4, name: "Jean Baggy Negro", category_slug: "jeans", price: 2490, sizes: ["38", "40", "42", "44"], image_key: "jns", badge: null, color_label: "Negro — vista lateral", stock: { "38": 2, "40": 2, "42": 2, "44": 1 } },
  { legacy_id: 5, name: "Jean Baggy Raw", category_slug: "jeans", price: 2590, sizes: ["38", "40", "42", "44"], image_key: "jn2", badge: "Últimos", color_label: "Negro raw", stock: { "38": 1, "40": 1, "42": 0, "44": 0 } },
  { legacy_id: 6, name: "Rugby Attitude", category_slug: "polos", price: 1890, sizes: ["S", "M", "L", "XL", "XXL", "XXXL"], image_key: "pb", badge: "Nuevo", color_label: "Bordo / Blanco", stock: { S: 3, M: 4, L: 4, XL: 3, XXL: 2, XXXL: 1 } },
  { legacy_id: 7, name: "Rugby Attitude", category_slug: "polos", price: 1890, sizes: ["S", "M", "L", "XL", "XXL", "XXXL"], image_key: "pb2", badge: null, color_label: "Bordo — vista 2", stock: { S: 2, M: 3, L: 3, XL: 2, XXL: 2, XXXL: 1 } },
  { legacy_id: 8, name: "Rugby Attitude", category_slug: "polos", price: 1890, sizes: ["S", "M", "L", "XL", "XXL", "XXXL"], image_key: "pn", badge: null, color_label: "Navy / Blanco", stock: { S: 3, M: 3, L: 3, XL: 2, XXL: 2, XXXL: 1 } },
  { legacy_id: 9, name: "Rugby Attitude", category_slug: "polos", price: 1890, sizes: ["S", "M", "L", "XL", "XXL", "XXXL"], image_key: "pw", badge: null, color_label: "Blanco / Navy", stock: { S: 2, M: 2, L: 2, XL: 2, XXL: 1, XXXL: 1 } },
  { legacy_id: 10, name: "Hoodie Inspired by Money", category_slug: "hoodies", price: 2190, sizes: ["S", "M", "L", "XL", "XXL", "XXXL"], image_key: "hd", badge: "Top", color_label: "Negro / Gris / Marrón", stock: { S: 2, M: 3, L: 3, XL: 2, XXL: 1, XXXL: 1 } },
  { legacy_id: 11, name: "Remera Polo Manga Larga", category_slug: "remeras", price: 990, sizes: ["S", "M", "L", "XL", "XXL", "XXXL"], image_key: "rm", badge: null, color_label: "Negro / Blanco", stock: { S: 4, M: 4, L: 3, XL: 2, XXL: 2, XXXL: 1 } },
];

const DEFAULT_SETTINGS = {
  shipping_flat_rate: 300,
  low_stock_threshold: 2,
  whatsapp_number: "59899123456",
  bank_transfer_info: "Banco: BROU\nTitular: BRED Indumentaria\nCuenta: XXXXX",
  instagram_handle: "@bred_indumentaria",
  contact_email: "bred.indumentaria@gmail.com",
};

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase credentials");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function seedDatabase() {
  const supabase = createAdminClient();

  for (const cat of SEED_CATEGORIES) {
    const { error } = await supabase
      .from("categories")
      .upsert(cat, { onConflict: "slug" });
    if (error) throw new Error(`Category seed failed: ${error.message}`);
  }

  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("id, slug");
  if (categoriesError) {
    throw new Error(`Could not load categories: ${categoriesError.message}`);
  }
  const catMap = Object.fromEntries((categories || []).map((c) => [c.slug, c.id]));

  let failedProducts = 0;
  for (const product of SEED_PRODUCTS) {
    const image_url = manifest[product.image_key] || `/products/${product.image_key}.jpg`;
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

    if (error || !inserted) {
      console.error("Product seed error:", product.name, error);
      failedProducts += 1;
      continue;
    }

    const stockRows = Object.entries(product.stock).map(([size, quantity]) => ({
      product_id: inserted.id,
      size,
      quantity,
    }));

    const { error: stockError } = await supabase.from("product_stock").upsert(stockRows, {
      onConflict: "product_id,size",
    });
    if (stockError) {
      console.error("Stock seed error:", product.name, stockError);
      failedProducts += 1;
    }
  }

  const { error: settingsError } = await supabase
    .from("settings")
    .upsert({ id: 1, ...DEFAULT_SETTINGS });
  if (settingsError) {
    throw new Error(`Settings seed failed: ${settingsError.message}`);
  }

  if (failedProducts > 0) {
    throw new Error(`${failedProducts} products failed to seed`);
  }
}

module.exports = { seedDatabase };
