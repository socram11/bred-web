import { NextResponse } from "next/server";
import { markOrderPaid } from "@/lib/orders";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.type === "payment" && body.data?.id) {
      const paymentId = body.data.id;
      const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

      if (!accessToken) {
        return NextResponse.json({ ok: false }, { status: 500 });
      }

      const paymentRes = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!paymentRes.ok) {
        return NextResponse.json({ ok: false }, { status: 400 });
      }

      const payment = await paymentRes.json();

      if (payment.status === "approved" && payment.external_reference) {
        await markOrderPaid(payment.external_reference, String(paymentId));
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("MP webhook error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok" });
}
