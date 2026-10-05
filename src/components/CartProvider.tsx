"use client";

import { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";
import type { CartItem, Product } from "@/lib/types";

type Action =
  | { type: "add"; product: Product }
  | { type: "setQuantity"; productId: string; quantity: number }
  | { type: "remove"; productId: string }
  | { type: "clear" }
  | { type: "load"; items: CartItem[] };

function reducer(state: CartItem[], action: Action): CartItem[] {
  switch (action.type) {
    case "add": {
      const { product } = action;
      const existing = state.find((i) => i.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return state;
        return state.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1, stock: product.stock } : i
        );
      }
      if (product.stock < 1) return state;
      return [
        ...state,
        { productId: product.id, name: product.name, price: product.price, stock: product.stock, quantity: 1 },
      ];
    }
    case "setQuantity": {
      if (action.quantity < 1) return state.filter((i) => i.productId !== action.productId);
      return state.map((i) =>
        i.productId === action.productId ? { ...i, quantity: Math.min(action.quantity, i.stock) } : i
      );
    }
    case "remove":
      return state.filter((i) => i.productId !== action.productId);
    case "clear":
      return [];
    case "load":
      return action.items;
  }
}

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  ready: boolean;
  add: (product: Product) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "boutique-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, dispatch] = useReducer(reducer, []);
  const [ready, setReady] = useState(false);

  // on recharge le panier sauvegardé une fois côté client
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) dispatch({ type: "load", items: JSON.parse(saved) });
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      ready,
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      add: (product) => dispatch({ type: "add", product }),
      setQuantity: (productId, quantity) => dispatch({ type: "setQuantity", productId, quantity }),
      remove: (productId) => dispatch({ type: "remove", productId }),
      clear: () => dispatch({ type: "clear" }),
    }),
    [items, ready]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé dans <CartProvider>");
  return ctx;
}
