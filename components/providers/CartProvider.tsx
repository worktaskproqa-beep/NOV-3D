"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  key: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  art: string;
  price: number;
  size: string;
  color: { hex: string; en: string; ar: string };
  qty: number;
};

type Ctx = {
  items: CartItem[];
  count: number;
  subtotal: number;
  hydrated: boolean;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  add: (item: Omit<CartItem, "key" | "qty">, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "nov-bag-v2"; // v2: catalogue is hoodies + caps only
const CartContext = createContext<Ctx | null>(null);

export const FREE_SHIPPING_THRESHOLD = 400;
export const SHIPPING_FEE = 25;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate persisted bag once on mount
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const add = useCallback<Ctx["add"]>((item, qty = 1) => {
    const key = `${item.slug}__${item.size}__${item.color.hex}`;
    setItems((prev) => {
      const found = prev.find((i) => i.key === key);
      if (found) return prev.map((i) => (i.key === key ? { ...i, qty: Math.min(i.qty + qty, 10) } : i));
      return [...prev, { ...item, key, qty }];
    });
    setDrawerOpen(true);
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setItems((prev) => (qty <= 0 ? prev.filter((i) => i.key !== key) : prev.map((i) => (i.key === key ? { ...i, qty: Math.min(qty, 10) } : i))));
  }, []);

  const remove = useCallback((key: string) => setItems((prev) => prev.filter((i) => i.key !== key)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<Ctx>(() => {
    const count = items.reduce((s, i) => s + i.qty, 0);
    const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
    return { items, count, subtotal, hydrated, drawerOpen, setDrawerOpen, add, setQty, remove, clear };
  }, [items, hydrated, drawerOpen, add, setQty, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
