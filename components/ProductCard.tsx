"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { useCart } from "@/components/CartProvider";

interface ProductCardProps {
  product: Product;
  lowStockThreshold: number;
  onToast: (msg: string) => void;
}

export function ProductCard({
  product,
  lowStockThreshold,
  onToast,
}: ProductCardProps) {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const stockMap = Object.fromEntries(
    (product.stock || []).map((s) => [s.size, s.quantity])
  );

  function handleAdd(e?: React.MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();
    if (!selectedSize) {
      onToast("Seleccioná un talle primero");
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
    onToast(`✓ ${product.name} (${selectedSize}) agregado`);
  }

  return (
    <div className="card">
      <Link
        href={`/producto/${product.id}`}
        className="card-link"
        prefetch
      >
        <div className="card-img">
          <Image
            src={product.image_url}
            alt={product.name}
            width={400}
            height={533}
          />
          {product.badge && <div className="card-badge">{product.badge}</div>}
        </div>
        <div className="card-body">
          <div className="card-name">{product.name}</div>
          <div className="card-color">{product.color_label}</div>
        </div>
      </Link>
      <div className="card-body card-body-actions">
        <div className="card-sizes-lbl">
          Talle: <b>{selectedSize || "—"}</b>
        </div>
        <div className="sizes-wrap">
          {product.sizes.map((size) => {
            const qty = stockMap[size] ?? 0;
            const disabled = qty <= 0;
            const low = qty > 0 && qty <= lowStockThreshold;
            return (
              <button
                key={size}
                className={`sz${selectedSize === size ? " on" : ""}${disabled ? " disabled" : ""}`}
                disabled={disabled}
                title={low ? `Últimos (${qty})` : disabled ? "Agotado" : undefined}
                onClick={() => !disabled && setSelectedSize(size)}
              >
                {size}
              </button>
            );
          })}
        </div>
        <div className="card-foot">
          <div className="card-price">
            <span className="cur">UYU </span>
            {product.price.toLocaleString("es-UY")}
          </div>
          <button className="card-add" onClick={handleAdd}>
            + Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
