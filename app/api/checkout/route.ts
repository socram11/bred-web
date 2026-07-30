import { NextResponse } from "next/server";
import { getSettings } from "@/lib/db";
import { createCheckoutPreference } from "@/lib/mercadopago";
import {
  createOrder,
  getWhatsAppUrlForOrder,
} from "@/lib/orders";
import type { CartItem, PaymentMethod, ShippingMethod } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customer_name,
      email,
      phone,
      shipping_method,
      payment_method,
      items,
    } = body as {
      customer_name: string;
      email: string;
      phone?: string;
      shipping_method: ShippingMethod;
      payment_method: PaymentMethod;
      items: CartItem[];
    };

    if (!customer_name?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: "Nombre y email son requeridos" },
        { status: 400 }
      );
    }

    if (!items?.length) {
      return NextResponse.json({ error: "Carrito vacío" }, { status: 400 });
    }

    if (!["mercadopago", "transfer"].includes(payment_method)) {
      return NextResponse.json(
        { error: "Método de pago no disponible" },
        { status: 400 }
      );
    }

    const settings = await getSettings();
    const { order, total, orderItems, shipping_cost } = await createOrder({
      customer_name: customer_name.trim(),
      email: email.trim(),
      phone,
      shipping_method,
      payment_method,
      items,
      settings,
    });

    if (payment_method === "mercadopago") {
      const preference = await createCheckoutPreference({
        orderId: order.id,
        items: orderItems,
        shippingCost: shipping_cost,
        customerEmail: email.trim(),
        customerName: customer_name.trim(),
      });

      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabase = createAdminClient();
      await supabase
        .from("orders")
        .update({ mp_preference_id: preference.preferenceId })
        .eq("id", order.id);

      const redirectUrl =
        process.env.MERCADOPAGO_SANDBOX === "true"
          ? preference.sandboxInitPoint || preference.initPoint
          : preference.initPoint;

      return NextResponse.json({
        orderId: order.id,
        redirectUrl,
      });
    }

    const whatsappUrl = getWhatsAppUrlForOrder(settings, {
      items: orderItems,
      total,
      customerName: customer_name.trim(),
      paymentLabel: "transferencia",
    });

    return NextResponse.json({
      orderId: order.id,
      whatsappUrl,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Error al procesar el checkout",
      },
      { status: 500 }
    );
  }
}
