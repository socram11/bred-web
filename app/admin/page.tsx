import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/db";
import { formatUYU } from "@/lib/mercadopago";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const settings = await getSettings();

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: stockRows } = await supabase
    .from("product_stock")
    .select("size, quantity, products(name, color_label)")
    .lte("quantity", settings.low_stock_threshold)
    .gt("quantity", 0)
    .order("quantity");

  return (
    <div className="admin-wrap">
      <h1 className="admin-h1">Dashboard</h1>

      <div className="admin-grid">
        <div className="admin-card">
          <div style={{ fontSize: 11, color: "#999", marginBottom: 8 }}>
            PEDIDOS RECIENTES
          </div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>
            {orders?.length || 0}
          </div>
        </div>
        <div className="admin-card">
          <div style={{ fontSize: 11, color: "#999", marginBottom: 8 }}>
            STOCK BAJO
          </div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>
            {stockRows?.length || 0}
          </div>
        </div>
      </div>

      <div className="admin-card">
        <h2 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>
          Alertas de stock bajo
        </h2>
        {!stockRows?.length ? (
          <p style={{ color: "#999", fontSize: 13 }}>Sin alertas por ahora.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Talle</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {stockRows.map((row, i) => {
                const product = Array.isArray(row.products)
                  ? row.products[0]
                  : row.products;
                return (
                <tr key={i}>
                  <td>
                    {product?.name} — {product?.color_label}
                  </td>
                  <td>{row.size}</td>
                  <td>
                    <span className="admin-badge low">{row.quantity}</span>
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="admin-card">
        <h2 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>
          Últimos pedidos
        </h2>
        {!orders?.length ? (
          <p style={{ color: "#999", fontSize: 13 }}>Sin pedidos aún.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link href={`/admin/orders/${order.id}`}>
                      {order.customer_name}
                    </Link>
                  </td>
                  <td>{formatUYU(order.total)}</td>
                  <td>
                    <span className={`admin-badge ${order.status}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    {new Date(order.created_at).toLocaleDateString("es-UY")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
