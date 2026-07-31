"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ProductImageUpload } from "@/components/admin/ProductImageUpload";

interface Category {
  id: string;
  slug: string;
  name: string;
}

interface StockRow {
  size: string;
  quantity: number;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    category_id: "",
    color_label: "",
    price: "",
    badge: "",
    sizes: "",
    image_url: "",
    active: true,
    stock: [] as StockRow[],
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch(`/api/products/${id}`).then((r) => r.json()),
    ]).then(([catData, productData]) => {
      setCategories(catData.categories || []);
      const p = productData.product;
      if (p) {
        setForm({
          name: p.name,
          category_id: p.category_id,
          color_label: p.color_label,
          price: String(p.price),
          badge: p.badge || "",
          sizes: (p.sizes || []).join(","),
          image_url: p.image_url,
          active: p.active,
          stock: p.stock || [],
        });
      }
    });
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!form.image_url) {
      setError("Subí una imagen para el producto");
      setLoading(false);
      return;
    }

    const sizes = form.sizes.split(",").map((s) => s.trim()).filter(Boolean);

    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        category_id: form.category_id,
        color_label: form.color_label,
        price: parseInt(form.price, 10),
        badge: form.badge || null,
        sizes,
        image_url: form.image_url,
        active: form.active,
        stock: form.stock,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Error al actualizar");
      setLoading(false);
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  function updateStock(size: string, quantity: number) {
    setForm((prev) => ({
      ...prev,
      stock: prev.stock.map((s) =>
        s.size === size ? { ...s, quantity } : s
      ),
    }));
  }

  return (
    <div className="admin-wrap">
      <h1 className="admin-h1">Editar producto</h1>
      <div className="admin-card" style={{ maxWidth: 560 }}>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Nombre</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label>Categoría</label>
            <select
              value={form.category_id}
              onChange={(e) =>
                setForm({ ...form, category_id: e.target.value })
              }
              required
            >
              <option value="">Seleccionar...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Color / variante</label>
            <input
              value={form.color_label}
              onChange={(e) =>
                setForm({ ...form, color_label: e.target.value })
              }
              required
            />
          </div>
          <div className="field-row">
            <div className="field">
              <label>Precio (UYU)</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label>Badge</label>
              <input
                value={form.badge}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
              />
            </div>
          </div>
          <div className="field">
            <label>Talles</label>
            <input
              value={form.sizes}
              onChange={(e) => setForm({ ...form, sizes: e.target.value })}
              required
            />
          </div>
          <ProductImageUpload
            value={form.image_url}
            onChange={(imageUrl) =>
              setForm((current) => ({ ...current, image_url: imageUrl }))
            }
            onUploadingChange={setUploading}
            required
          />
          <div className="field">
            <label>
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) =>
                  setForm({ ...form, active: e.target.checked })
                }
              />{" "}
              Activo en tienda
            </label>
          </div>

          <h3 style={{ fontSize: 12, margin: "16px 0 8px" }}>Stock por talle</h3>
          {form.stock.map((row) => (
            <div className="field-row" key={row.size}>
              <div className="field">
                <label>Talle {row.size}</label>
                <input
                  type="number"
                  min={0}
                  value={row.quantity}
                  onChange={(e) =>
                    updateStock(row.size, parseInt(e.target.value, 10) || 0)
                  }
                />
              </div>
            </div>
          ))}

          {error && (
            <p style={{ color: "#c00", fontSize: 12, marginBottom: 12 }}>
              {error}
            </p>
          )}
          <button
            className="pay-btn"
            type="submit"
            disabled={loading || uploading || !form.image_url}
          >
            {uploading
              ? "Subiendo imagen..."
              : loading
                ? "Guardando..."
                : "Guardar cambios"}
          </button>
          <Link
            href="/admin/products"
            style={{
              display: "inline-block",
              marginTop: 12,
              fontSize: 12,
              color: "#666",
            }}
          >
            Cancelar
          </Link>
        </form>
      </div>
    </div>
  );
}
