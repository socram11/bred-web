import { createAdminClient } from "@/lib/supabase/admin";
import { buildWhatsAppUrl } from "@/lib/mercadopago";
import type {
  CartItem,
  OrderItem,
  PaymentMethod,
  Settings,
  ShippingMethod,
} from "@/lib/types";

export async function validateStock(items: CartItem[]) {
  const supabase = createAdminClient();

  for (const item of items) {
    const { data, error } = await supabase
      .from("product_stock")
      .select("quantity")
      .eq("product_id", item.product_id)
      .eq("size", item.size)
      .single();

    if (error || !data || data.quantity < item.qty) {
      throw new Error(
        `Stock insuficiente para ${item.name} talle ${item.size}`
      );
    }
  }
}

export function cartToOrderItems(items: CartItem[]): OrderItem[] {
  return items.map((item) => ({
    product_id: item.product_id,
    name: item.name,
    color_label: item.color_label,
    size: item.size,
    qty: item.qty,
    unit_price: item.price,
    image_url: item.image_url,
  }));
}

export async function createOrder(params: {
  customer_name: string;
  email: string;
  phone?: string;
  shipping_method: ShippingMethod;
  payment_method: PaymentMethod;
  items: CartItem[];
  settings: Settings;
}) {
  const subtotal = params.items.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
  const shipping_cost =
    params.shipping_method === "delivery"
      ? params.settings.shipping_flat_rate
      : 0;
  const total = subtotal + shipping_cost;
  const orderItems = cartToOrderItems(params.items);

  await validateStock(params.items);

  const supabase = createAdminClient();
  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      customer_name: params.customer_name,
      email: params.email,
      phone: params.phone || null,
      items: orderItems,
      subtotal,
      shipping_cost,
      total,
      shipping_method: params.shipping_method,
      payment_method: params.payment_method,
      status: "pending",
    })
    .select("*")
    .single();

  if (error || !order) {
    throw new Error(error?.message || "No se pudo crear el pedido");
  }

  return { order, subtotal, shipping_cost, total, orderItems };
}

export async function markOrderPaid(orderId: string, mpPaymentId?: string) {
  const supabase = createAdminClient();

  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (fetchError || !order) return null;
  if (order.status === "paid") return order;

  const { error: updateError } = await supabase
    .from("orders")
    .update({
      status: "paid",
      mp_payment_id: mpPaymentId || order.mp_payment_id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (updateError) return null;

  await supabase.rpc("decrement_stock_for_order", {
    order_items: order.items,
  });

  return order;
}

export function buildOrderWhatsAppMessage(params: {
  items: OrderItem[];
  total: number;
  customerName: string;
  paymentLabel: string;
}) {
  const itemsText = params.items
    .map(
      (item) =>
        `${item.name} talle ${item.size} x${item.qty} — UYU ${(
          item.unit_price * item.qty
        ).toLocaleString("es-UY")}`
    )
    .join("\n");

  return `Hola BRED! Quiero pagar por ${params.paymentLabel}.\n\nPedido:\n${itemsText}\n\nTotal: UYU ${params.total.toLocaleString("es-UY")}\nNombre: ${params.customerName}`;
}

export function getWhatsAppUrlForOrder(
  settings: Settings,
  params: {
    items: OrderItem[];
    total: number;
    customerName: string;
    paymentLabel: string;
  }
) {
  return buildWhatsAppUrl(
    settings.whatsapp_number,
    buildOrderWhatsAppMessage(params)
  );
}
