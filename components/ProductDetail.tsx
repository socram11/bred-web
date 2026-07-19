"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Category, Product, Settings } from "@/lib/types";
import { useCart } from "@/components/CartProvider";
import { ProductCard } from "@/components/ProductCard";
import { StoreShell } from "@/components/StoreShell";

interface ProductDetailProps {
  product: Product;
  related: Product[];
  categories: Category[];
  settings: Settings;
  categoryName?: string;
}

export function ProductDetail({
  product,
  related,
  categories,
  settings,
  categoryName,
}: ProductDetailProps) {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const stockMap = Object.fromEntries(
    (product.stock || []).map((s) => [s.size, s.quantity])
  );

  const totalStock = Object.values(stockMap).reduce((a, b) => a + b, 0);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  }

  function handleAdd() {
    if (!selectedSize) {
      showToast("Seleccioná un talle primero");
      return;
    }
    addItem({
      product_id: product.id,
      name: product.name,
      color_label: product.color_label,
      size: selectedSize,
      price: product.price,
      image_url: product.image_url,
    });
    showToast(`✓ ${product.name} (${selectedSize}) agregado`);
  }

  return (
    <StoreShell
      categories={categories}
      settings={settings}
      activeCategory={product.category_slug}
    >
      <div className="product-page">
        <div className="product-breadcrumb">
          <Link href="/">Inicio</Link>
          <span>/</span>
          {categoryName && product.category_slug && (
            <>
              <Link href={`/?cat=${product.category_slug}`}>{categoryName}</Link>
              <span>/</span>
            </>
          )}
          <span>{product.name}</span>
        </div>

        <div className="product-layout">
          <div className="product-gallery">
            <div className="product-img-main">
              <Image
                src={product.image_url}
                alt={product.name}
                width={600}
                height={800}
                priority
                unoptimized
              />
              {product.badge && (
                <div className="card-badge">{product.badge}</div>
              )}
            </div>
          </div>

          <div className="product-info">
            <p className="product-cat-label">
              {categoryName || product.category_slug}
            </p>
            <h1 className="product-name">{product.name}</h1>
            <p className="product-color">{product.color_label}</p>

            <div className="product-price-lg">
              <span className="cur">UYU </span>
              {product.price.toLocaleString("es-UY")}
            </div>

            <div className="product-sizes-section">
              <div className="card-sizes-lbl">
                Talle: <b>{selectedSize || "—"}</b>
              </div>
              <div className="sizes-wrap sizes-wrap-lg">
                {product.sizes.map((size) => {
                  const qty = stockMap[size] ?? 0;
                  const disabled = qty <= 0;
                  const low =
                    qty > 0 && qty <= settings.low_stock_threshold;
                  return (
                    <button
                      key={size}
                      className={`sz${selectedSize === size ? " on" : ""}${disabled ? " disabled" : ""}`}
                      disabled={disabled}
                      title={
                        low
                          ? `Últimos (${qty})`
                          : disabled
                            ? "Agotado"
                            : undefined
                      }
                      onClick={() => !disabled && setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              className="product-add-btn"
              onClick={handleAdd}
              disabled={totalStock === 0}
            >
              {totalStock === 0 ? "Agotado" : "+ Agregar al carrito"}
            </button>

            <div className="product-meta">
              <p>🔒 Pago seguro con Mercado Pago</p>
              <p>📦 Envío a todo Uruguay · Retiro en Montevideo</p>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="product-related">
            <div className="shop-header">
              <span className="shop-title">También te puede gustar</span>
            </div>
            <div className="grid">
              {related.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  lowStockThreshold={settings.low_stock_threshold}
                  onToast={showToast}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <div className={`toast${toast ? " show" : ""}`}>{toast}</div>
    </StoreShell>
  );
}
