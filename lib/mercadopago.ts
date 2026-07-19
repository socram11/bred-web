import { MercadoPagoConfig, Preference } from "mercadopago";
import type { OrderItem } from "./types";

function getClient() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN is not configured");
  }
  return new MercadoPagoConfig({ accessToken });
}

export async function createCheckoutPreference(params: {
  orderId: string;
  items: OrderItem[];
  shippingCost: number;
  customerEmail: string;
  customerName: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const client = getClient();
  const preference = new Preference(client);

  const mpItems = params.items.map((item) => ({
    id: item.product_id,
    title: `${item.name} (${item.size})`,
    description: item.color_label,
    quantity: item.qty,
    unit_price: item.unit_price,
    currency_id: "UYU",
  }));

  if (params.shippingCost > 0) {
    mpItems.push({
      id: "shipping",
      title: "Envío",
      description: "Envío a Uruguay",
      quantity: 1,
      unit_price: params.shippingCost,
      currency_id: "UYU",
    });
  }

  const result = await preference.create({
    body: {
      items: mpItems,
      payer: {
        name: params.customerName,
        email: params.customerEmail,
      },
      external_reference: params.orderId,
      back_urls: {
        success: `${siteUrl}/checkout/success`,
        failure: `${siteUrl}/checkout/failure`,
        pending: `${siteUrl}/checkout/pending`,
      },
      auto_return: "approved",
      notification_url: `${siteUrl}/api/webhooks/mp`,
    },
  });

  return {
    preferenceId: result.id,
    initPoint: result.init_point,
    sandboxInitPoint: result.sandbox_init_point,
  };
}

export function formatUYU(amount: number) {
  return `UYU ${amount.toLocaleString("es-UY")}`;
}

export function buildWhatsAppUrl(
  phone: string,
  message: string
): string {
  const normalized = phone.replace(/\D/g, "");
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
