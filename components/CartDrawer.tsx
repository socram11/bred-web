"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/components/CartProvider";
import { formatUYU } from "@/lib/mercadopago";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export function CartDrawer({ open, onClose, onCheckout }: CartDrawerProps) {
  const { cart, removeItem, total } = useCart();

  return (
    <>
      <div
        className={`cart-ov${open ? " open" : ""}`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <div className={`cart-drw${open ? " open" : ""}`}>
        <div className="cart-hd">
          <span className="cart-hd-t">Tu carrito</span>
          <button className="cart-x" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </div>
        <div className="cart-bd">
          {!cart.length ? (
            <div className="cart-empty">Tu carrito está vacío</div>
          ) : (
            cart.map((item) => (
              <div className="citem" key={item.key}>
                <div className="citem-img">
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    width={64}
                    height={80}
                    unoptimized
                  />
                </div>
                <div className="citem-info">
                  <div className="citem-name">{item.name}</div>
                  <div className="citem-meta">
                    Talle {item.size} · {item.color_label} · x{item.qty}
                  </div>
                  <div className="citem-price">
                    {formatUYU(item.price * item.qty)}
                  </div>
                </div>
                <button
                  className="citem-rm"
                  onClick={() => removeItem(item.key)}
                  aria-label="Eliminar"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="cart-ft">
            <div className="cart-total-row">
              <span className="cart-total-lbl">Total</span>
              <span className="cart-total-val">{formatUYU(total)}</span>
            </div>
            <button className="cart-checkout" onClick={onCheckout}>
              Pagar ahora
            </button>
            <p className="cart-note">🔒 Pago 100% seguro · SSL encriptado</p>
          </div>
        )}
      </div>
    </>
  );
}
