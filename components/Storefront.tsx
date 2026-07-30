"use client";

import { useEffect, useMemo, useState } from "react";
import type { Category, Product, Settings } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";
import { StoreShell } from "@/components/StoreShell";

interface StorefrontProps {
  products: Product[];
  categories: Category[];
  settings: Settings;
  initialCategory?: string;
}

export function Storefront({
  products,
  categories,
  settings,
  initialCategory = "todos",
}: StorefrontProps) {
  const [toast, setToast] = useState("");
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  const filtered = useMemo(() => {
    if (activeCategory === "todos") return products;
    return products.filter((p) => p.category_slug === activeCategory);
  }, [products, activeCategory]);

  useEffect(() => {
    const handlePopState = () => {
      const slug = new URLSearchParams(window.location.search).get("cat");
      const isValid = categories.some((category) => category.slug === slug);
      setActiveCategory(slug && isValid ? slug : "todos");
    };

    handlePopState();
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [categories]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  }

  function scrollToShop() {
    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
  }

  function changeCategory(slug: string) {
    setActiveCategory(slug);
    const url = slug === "todos" ? "/" : `/?cat=${slug}`;
    window.history.pushState(null, "", url);
  }

  return (
    <StoreShell
      categories={categories}
      settings={settings}
      activeCategory={activeCategory}
      onCategoryChange={changeCategory}
    >
      <div className="hero">
        <div>
          <h1>BRED</h1>
          <p>Montevideo, Uruguay — Streetwear Masculino</p>
          <div className="hero-btns">
            <button className="btn-blk" onClick={scrollToShop}>
              Ver colección
            </button>
          </div>
        </div>
        <div className="hero-tag">
          Temporada 2025
          <br />
          Minimalismo
          <br />
          Elegancia
          <br />
          Street
        </div>
      </div>

      <section className="shop" id="shop">
        <div className="shop-header">
          <span className="shop-title">Colección 2025</span>
          <span className="shop-count">
            {filtered.length} producto{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="grid">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              lowStockThreshold={settings.low_stock_threshold}
              onToast={showToast}
            />
          ))}
        </div>
      </section>

      <div className="pagos-section">
        <div className="pagos-title-main">Medios de pago</div>
        <div className="pagos-grid">
          <div className="pago-card">
            <div className="pago-icon">📱</div>
            <div className="pago-name">Mercado Pago</div>
            <div className="pago-desc">
              Hasta 12 cuotas sin recargo. La pasarela más segura de Latinoamérica
            </div>
          </div>
          <div className="pago-card">
            <div className="pago-icon">🏦</div>
            <div className="pago-name">Transferencia</div>
            <div className="pago-desc">
              Depósito o transferencia bancaria. Confirmación inmediata
            </div>
          </div>
        </div>
        <div className="seguridad">
          <div className="seg-item">
            <span className="seg-icon">🔒</span> Pago 100% seguro
          </div>
          <div className="seg-item">
            <span className="seg-icon">🛡️</span> SSL encriptado
          </div>
          <div className="seg-item">
            <span className="seg-icon">✅</span> Datos protegidos
          </div>
          <div className="seg-item">
            <span className="seg-icon">🏆</span> Mercado Pago certificado
          </div>
        </div>
      </div>

      <div className={`toast${toast ? " show" : ""}`}>{toast}</div>
    </StoreShell>
  );
}
