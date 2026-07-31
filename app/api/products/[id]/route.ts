import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*, categories(slug), product_stock(size, quantity)")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    product: {
      ...data,
      category_slug: data.categories?.slug,
      stock: data.product_stock || [],
    },
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const body = await request.json();

  const { error } = await supabase
    .from("products")
    .update({
      name: body.name,
      category_id: body.category_id,
      color_label: body.color_label,
      price: body.price,
      badge: body.badge,
      image_url: body.image_url,
      sizes: body.sizes,
      active: body.active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (body.stock?.length) {
    for (const row of body.stock) {
      await supabase
        .from("product_stock")
        .upsert(
          {
            product_id: id,
            size: row.size,
            quantity: row.quantity,
          },
          { onConflict: "product_id,size" }
        );
    }
  }

  revalidatePath("/");
  revalidatePath(`/producto/${id}`);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("image_url")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const storageMarker = "/storage/v1/object/public/products/";
  if (product?.image_url?.includes(storageMarker)) {
    const storagePath = decodeURIComponent(
      product.image_url.split(storageMarker)[1]
    );
    await supabase.storage.from("products").remove([storagePath]);
  }

  revalidatePath("/");
  revalidatePath(`/producto/${id}`);
  return NextResponse.json({ ok: true });
}
