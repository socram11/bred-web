import Link from "next/link";
import Image from "next/image";
import { getAllProductsAdmin } from "@/lib/db";
import { formatUYU } from "@/lib/mercadopago";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getAllProductsAdmin();

  return (
    <div className="admin-wrap">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h1 className="admin-h1" style={{ marginBottom: 0 }}>
          Productos
        </h1>
        <Link href="/admin/products/new" className="btn-blk">
          + Nuevo producto
        </Link>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    width={40}
                    height={50}
                    unoptimized
                    style={{ objectFit: "cover" }}
                  />
                </td>
                <td>
                  {product.name}
                  <br />
                  <span style={{ color: "#999", fontSize: 11 }}>
                    {product.color_label}
                  </span>
                </td>
                <td>{product.category_slug}</td>
                <td>{formatUYU(product.price)}</td>
                <td>
                  <span
                    className={`admin-badge${product.active ? " paid" : ""}`}
                  >
                    {product.active ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td>
                  <Link href={`/admin/products/${product.id}`}>Editar</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
