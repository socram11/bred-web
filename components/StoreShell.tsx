"use client";

import { useState } from "react";
import Link from "next/link";
import type { Category, Settings } from "@/lib/types";
import { useCart } from "@/components/CartProvider";
import { CartDrawer } from "@/components/CartDrawer";
import { CheckoutModal } from "@/components/CheckoutModal";

interface StoreShellProps {
  categories: Category[];
  settings: Settings;
  children: React.ReactNode;
  activeCategory?: string;
}

export function StoreShell({
  categories,
  settings,
  children,
  activeCategory,
}: StoreShellProps) {
  const { count } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  }

  const navCategories = [
    { slug: "todos", name: "Todo" },
    ...categories.map((c) => ({ slug: c.slug, name: c.name })),
  ];

  return (
    <>
      <div className="topbar">
        <div className="topbar-inner">
          ENVÍOS A TODO URUGUAY &nbsp;·&nbsp; MERCADO PAGO HASTA 12 CUOTAS
          &nbsp;·&nbsp;  &nbsp;·&nbsp; ENVÍOS A
          TODO URUGUAY &nbsp;·&nbsp; MERCADO PAGO HASTA 12 CUOTAS &nbsp;·&nbsp;
        </div>
      </div>

      <nav>
        <div className="nav-top">
          <Link href="/" className="logo">
            BRED
          </Link>
          <div className="nav-right">
            <button className="cart-ico" onClick={() => setCartOpen(true)}>
              🛍<span className="badge">{count}</span>
            </button>
          </div>
        </div>
        <div className="cat-nav">
          {navCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={cat.slug === "todos" ? "/" : `/?cat=${cat.slug}`}
              className={activeCategory === cat.slug ? "active" : ""}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </nav>

      {children}

      <div className="contacto-section">
        <div className="contacto-title">Contacto</div>
        <div className="contacto-grid">
          <div className="contacto-card">
            <div className="contacto-icon">📸</div>
            <div className="contacto-name">Instagram</div>
            <a
              href="https://instagram.com/bred_indumentaria"
              target="_blank"
              rel="noreferrer"
              className="contacto-val"
            >
              {settings.instagram_handle}
            </a>
          </div>
          <div className="contacto-card">
            <div className="contacto-icon">🎵</div>
            <div className="contacto-name">TikTok</div>
            <a
              href="https://tiktok.com/@bred_indumentaria"
              target="_blank"
              rel="noreferrer"
              className="contacto-val"
            >
              @bred_indumentaria
            </a>
          </div>
          <div className="contacto-card">
            <div className="contacto-icon">✉️</div>
            <div className="contacto-name">Email</div>
            <a href={`mailto:${settings.contact_email}`} className="contacto-val">
              {settings.contact_email}
            </a>
          </div>
          <div className="contacto-card">
            <div className="contacto-icon">📍</div>
            <div className="contacto-name">Ubicación</div>
            <span className="contacto-val">Montevideo, Uruguay</span>
          </div>
        </div>
      </div>

      <footer>
        <div className="foot-bottom">
          <span className="foot-copy">
            © 2025 BRED — Todos los derechos reservados
          </span>
          <div className="foot-social">
            <a
              href="https://instagram.com/bred_indumentaria"
              target="_blank"
              rel="noreferrer"
            >
              Instagram
            </a>
            <a
              href="https://tiktok.com/@bred_indumentaria"
              target="_blank"
              rel="noreferrer"
            >
              TikTok
            </a>
          </div>
        </div>
      </footer>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        settings={settings}
        onToast={showToast}
        onSuccess={() => setCheckoutOpen(false)}
      />

      <div className={`toast${toast ? " show" : ""}`}>{toast}</div>
    </>
  );
}