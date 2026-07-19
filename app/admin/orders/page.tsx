import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatUYU } from "@/lib/mercadopago";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="admin-wrap">
      <h1 className="admin-h1">Pedidos</h1>
      <div className="admin-card">
        {!orders?.length ? (
          <p style={{ color: "#999" }}>Sin pedidos aún.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Email</th>
                <th>Total</th>
                <th>Pago</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.customer_name}</td>
                  <td>{order.email}</td>
                  <td>{formatUYU(order.total)}</td>
                  <td>{order.payment_method}</td>
                  <td>
                    <span className={`admin-badge ${order.status}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    {new Date(order.created_at).toLocaleString("es-UY")}
                  </td>
                  <td>
                    <Link href={`/admin/orders/${order.id}`}>Ver</Link>
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
