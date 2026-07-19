import { CartProvider } from "@/components/CartProvider";
import { Storefront } from "@/components/Storefront";
import { getCategories, getProducts, getSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams: Promise<{ cat?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { cat } = await searchParams;
  const [products, categories, settings] = await Promise.all([
    getProducts(),
    getCategories(),
    getSettings(),
  ]);

  const validSlugs = categories.map((c) => c.slug);
  const initialCategory =
    cat && validSlugs.includes(cat) ? cat : "todos";

  return (
    <CartProvider>
      <Storefront
        products={products}
        categories={categories}
        settings={settings}
        initialCategory={initialCategory}
      />
    </CartProvider>
  );
}
