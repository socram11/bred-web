import { NextResponse } from "next/server";
import { seedDatabase } from "@/lib/db";

export async function POST(request: Request) {
  const secret = request.headers.get("x-seed-secret");
  if (secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    await seedDatabase();
    return NextResponse.json({ ok: true, message: "Base de datos sembrada" });
  } catch (err) {
    console.error("Seed error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al sembrar" },
      { status: 500 }
    );
  }
}
