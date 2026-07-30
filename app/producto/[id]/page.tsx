import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CartProvider } from "@/components/CartProvider";
import { ProductDetail } from "@/components/ProductDetail";
import {
  getCategories,
  getProductById,
  getProducts,
  getRelatedProducts,
  getSettings,
} from "@/lib/db";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return { title: "Producto no encontrado — BRED" };

  return {
    title: `${product.name} — ${product.color_label} | BRED`,
    description: `${product.name} ${product.color_label}. UYU ${product.price.toLocaleString("es-UY")}. BRED Indumentaria Masculina, Montevideo.`,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const [product, categories, settings, allProducts] = await Promise.all([
    getProductById(id),
    getCategories(),
    getSettings(),
    getProducts(),
  ]);

  if (!product) notFound();

  const related = getRelatedProducts(product, allProducts);
  const categoryName = categories.find(
    (c) => c.slug === product.category_slug
  )?.name;

  return (
    <CartProvider>
      <ProductDetail
        product={product}
        related={related}
        categories={categories}
        settings={settings}
        categoryName={categoryName}
      />
    </CartProvider>
  );
}
