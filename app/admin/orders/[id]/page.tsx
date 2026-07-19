"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Order, OrderStatus } from "@/lib/types";
import { formatUYU } from "@/lib/mercadopago";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((data) => setOrder(data.order));
  }, [id]);

  async function updateStatus(status: OrderStatus) {
    setLoading(true);
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (data.order) setOrder(data.order);
    setLoading(false);
  }

  if (!order) {
    return (
      <div className="admin-wrap">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="admin-wrap">
      <Link href="/admin/orders" style={{ fontSize: 12, color: "#666" }}>
        ← Volver a pedidos
      </Link>
      <h1 className="admin-h1">Pedido de {order.customer_name}</h1>

      <div className="admin-card">
        <p>
          <strong>Email:</strong> {order.email}
        </p>
        <p>
          <strong>Teléfono:</strong> {order.phone || "—"}
        </p>
        <p>
          <strong>Envío:</strong> {order.shipping_method}
        </p>
        <p>
          <strong>Pago:</strong> {order.payment_method}
        </p>
        <p>
          <strong>Estado:</strong>{" "}
          <span className={`admin-badge ${order.status}`}>{order.status}</span>
        </p>
        <p>
          <strong>Total:</strong> {formatUYU(order.total)}
        </p>
      </div>

      <div className="admin-card">
        <h2 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
          Ítems
        </h2>
        {order.items.map((item, i) => (
          <div key={i} style={{ padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
            {item.name} ({item.size}) x{item.qty} —{" "}
            {formatUYU(item.unit_price * item.qty)}
          </div>
        ))}
      </div>

      <div className="admin-card">
        <h2 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
          Cambiar estado
        </h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(["pending", "paid", "confirmed", "shipped", "cancelled"] as OrderStatus[]).map(
            (status) => (
              <button
                key={status}
                className={`btn-wht${order.status === status ? "" : ""}`}
                disabled={loading || order.status === status}
                onClick={() => updateStatus(status)}
              >
                {status}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
