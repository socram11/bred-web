import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(slug), product_stock(size, quantity)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const products = (data || []).map((p) => ({
    ...p,
    category_slug: p.categories?.slug,
    stock: p.product_stock || [],
  }));

  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      name: body.name,
      category_id: body.category_id,
      color_label: body.color_label,
      price: body.price,
      badge: body.badge,
      image_url: body.image_url,
      sizes: body.sizes,
      active: true,
    })
    .select("id")
    .single();

  if (error || !product) {
    return NextResponse.json(
      { error: error?.message || "Error al crear producto" },
      { status: 500 }
    );
  }

  if (body.stock?.length) {
    const stockRows = body.stock.map(
      (s: { size: string; quantity: number }) => ({
        product_id: product.id,
        size: s.size,
        quantity: s.quantity,
      })
    );
    await supabase.from("product_stock").insert(stockRows);
  }

  revalidatePath("/");
  return NextResponse.json({ product });
}
