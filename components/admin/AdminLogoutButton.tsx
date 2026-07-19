"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function AdminLogoutButton() {
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      style={{
        background: "none",
        border: "none",
        color: "#aaa",
        cursor: "pointer",
        fontSize: 11,
        letterSpacing: "1.5px",
        textTransform: "uppercase",
        fontFamily: "inherit",
      }}
    >
      Salir
    </button>
  );
}
