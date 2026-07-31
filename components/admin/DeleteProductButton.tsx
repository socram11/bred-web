"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function removeProduct() {
    const confirmed = window.confirm(
      `¿Eliminar "${productName}"? Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    setDeleting(true);
    const response = await fetch(`/api/products/${productId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json();
      window.alert(data.error || "No se pudo eliminar el producto");
      setDeleting(false);
      return;
    }

    router.refresh();
  }

  return (
    <button
      type="button"
      className="admin-delete-btn"
      disabled={deleting}
      onClick={removeProduct}
    >
      {deleting ? "Eliminando…" : "Eliminar"}
    </button>
  );
}
