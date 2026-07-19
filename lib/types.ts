export type CategorySlug = "jeans" | "polos" | "hoodies" | "remeras" | "todos";

export interface Category {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
}

export interface ProductStock {
  size: string;
  quantity: number;
}

export interface Product {
  id: string;
  legacy_id?: number | null;
  name: string;
  category_id: string;
  category_slug?: string;
  color_label: string;
  price: number;
  badge: string | null;
  image_url: string;
  sizes: string[];
  active: boolean;
  stock?: ProductStock[];
}

export interface CartItem {
  key: string;
  product_id: string;
  name: string;
  color_label: string;
  size: string;
  price: number;
  qty: number;
  image_url: string;
}

export interface OrderItem {
  product_id: string;
  name: string;
  color_label: string;
  size: string;
  qty: number;
  unit_price: number;
  image_url?: string;
}

export type ShippingMethod = "delivery" | "pickup";
export type PaymentMethod = "mercadopago" | "transfer" | "cash";
export type OrderStatus =
  | "pending"
  | "paid"
  | "confirmed"
  | "shipped"
  | "cancelled";

export interface Order {
  id: string;
  customer_name: string;
  email: string;
  phone: string | null;
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  total: number;
  shipping_method: ShippingMethod;
  payment_method: PaymentMethod;
  status: OrderStatus;
  mp_preference_id: string | null;
  mp_payment_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Settings {
  shipping_flat_rate: number;
  low_stock_threshold: number;
  whatsapp_number: string;
  bank_transfer_info: string;
  instagram_handle: string;
  contact_email: string;
}

export interface CheckoutPayload {
  customer_name: string;
  email: string;
  phone?: string;
  shipping_method: ShippingMethod;
  payment_method: PaymentMethod;
  items: CartItem[];
}
