"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartItem } from "@/lib/types";

interface CartContextValue {
  cart: CartItem[];
  addItem: (item: Omit<CartItem, "key" | "qty">) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "bred-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCart(JSON.parse(raw));
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);

  const addItem = useCallback((item: Omit<CartItem, "key" | "qty">) => {
    const key = `${item.product_id}_${item.size}`;
    setCart((prev) => {
      const existing = prev.find((x) => x.key === key);
      if (existing) {
        return prev.map((x) =>
          x.key === key ? { ...x, qty: x.qty + 1 } : x
        );
      }
      return [...prev, { ...item, key, qty: 1 }];
    });
  }, []);

  const removeItem = useCallback((key: string) => {
    setCart((prev) => prev.filter((x) => x.key !== key));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const total = useMemo(
    () => cart.reduce((sum, x) => sum + x.price * x.qty, 0),
    [cart]
  );
  const count = useMemo(
    () => cart.reduce((sum, x) => sum + x.qty, 0),
    [cart]
  );

  const value = useMemo(
    () => ({ cart, addItem, removeItem, clearCart, total, count }),
    [cart, addItem, removeItem, clearCart, total, count]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
