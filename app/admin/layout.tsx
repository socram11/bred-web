import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="admin-body">
      {user && (
        <nav className="admin-nav">
          <Link href="/admin" className="logo">
            BRED ADMIN
          </Link>
          <div className="admin-nav-links">
            <Link href="/admin">Dashboard</Link>
            <Link href="/admin/products">Productos</Link>
            <Link href="/admin/orders">Pedidos</Link>
            <Link href="/">Tienda</Link>
            <AdminLogoutButton />
          </div>
        </nav>
      )}
      {children}
    </div>
  );
}
