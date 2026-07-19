import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SEED_CATEGORIES } from "@/lib/seed-data";

async function ensureCategories() {
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("categories")
    .select("id, slug, name, sort_order")
    .order("sort_order");

  if (existing && existing.length > 0) {
    return existing;
  }

  await admin.from("categories").upsert(SEED_CATEGORIES, {
    onConflict: "slug",
  });

  const { data: seeded } = await admin
    .from("categories")
    .select("id, slug, name, sort_order")
    .order("sort_order");

  return seeded || [];
}

export async function GET() {
  try {
    const categories = await ensureCategories();
    return NextResponse.json({
      categories: categories.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
      })),
    });
  } catch (err) {
    // Fallback: try anon client read
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("categories")
        .select("id, slug, name")
        .order("sort_order");

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ categories: data || [] });
    } catch {
      return NextResponse.json(
        {
          error:
            err instanceof Error ? err.message : "Error al cargar categorías",
        },
        { status: 500 }
      );
    }
  }
}
