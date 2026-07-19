"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Category {
  id: string;
  slug: string;
  name: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    category_id: "",
    color_label: "",
    price: "",
    badge: "",
    sizes: "S,M,L,XL",
    image_url: "",
    stock: "3,3,3,3",
  });

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        const list = data.categories || [];
        setCategories(list);
        if (list.length && !form.category_id) {
          setForm((prev) => ({ ...prev, category_id: list[0].id }));
        }
      })
      .catch(() => setError("No se pudieron cargar las categorías"));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const sizes = form.sizes.split(",").map((s) => s.trim()).filter(Boolean);
    const stockValues = form.stock.split(",").map((s) => parseInt(s.trim(), 10));
    const stock = sizes.map((size, i) => ({
      size,
      quantity: stockValues[i] ?? 0,
    }));

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        category_id: form.category_id,
        color_label: form.color_label,
        price: parseInt(form.price, 10),
        badge: form.badge || null,
        sizes,
        image_url: form.image_url,
        stock,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Error al crear producto");
      setLoading(false);
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  return (
    <div className="admin-wrap">
      <h1 className="admin-h1">Nuevo producto</h1>
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
            {categories.length === 0 && (
              <p style={{ fontSize: 11, color: "#999", marginTop: 6 }}>
                Cargando categorías...
              </p>
            )}
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
                placeholder="Top, Nuevo..."
              />
            </div>
          </div>
          <div className="field">
            <label>Talles (separados por coma)</label>
            <input
              value={form.sizes}
              onChange={(e) => setForm({ ...form, sizes: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label>Stock por talle (separados por coma)</label>
            <input
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label>URL de imagen</label>
            <input
              value={form.image_url}
              onChange={(e) =>
                setForm({ ...form, image_url: e.target.value })
              }
              placeholder="/products/ejemplo.jpg"
              required
            />
          </div>
          {error && (
            <p style={{ color: "#c00", fontSize: 12, marginBottom: 12 }}>
              {error}
            </p>
          )}
          <button className="pay-btn" type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Crear producto"}
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
