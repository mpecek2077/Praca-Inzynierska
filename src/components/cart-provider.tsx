"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CART_STORAGE_KEY, type CartItem } from "@/lib/cart-types";

type AddToCartInput = Omit<CartItem, "quantity"> & { quantity?: number };

type CartContextValue = {
  items: CartItem[];
  ready: boolean;
  itemCount: number;
  totalPln: number;
  addItem: (item: AddToCartInput) => void;
  setQuantity: (partId: string, quantity: number) => void;
  removeItem: (partId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStoredCart(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as CartItem[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(
      (item) =>
        item &&
        typeof item.partId === "string" &&
        typeof item.name === "string" &&
        typeof item.pricePln === "number" &&
        typeof item.quantity === "number",
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(readStoredCart());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const addItem = useCallback((item: AddToCartInput) => {
    setItems((prev) => {
      const existing = prev.find((entry) => entry.partId === item.partId);
      if (existing) {
        return prev.map((entry) =>
          entry.partId === item.partId
            ? {
                ...entry,
                quantity: entry.quantity + (item.quantity ?? 1),
              }
            : entry,
        );
      }
      return [
        ...prev,
        {
          partId: item.partId,
          name: item.name,
          pricePln: item.pricePln,
          quantity: item.quantity ?? 1,
          brandName: item.brandName,
          modelName: item.modelName,
          generationName: item.generationName,
          imageUrl: item.imageUrl,
        },
      ];
    });
  }, []);

  const setQuantity = useCallback((partId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((entry) => entry.partId !== partId);
      }
      return prev.map((entry) =>
        entry.partId === partId ? { ...entry, quantity } : entry,
      );
    });
  }, []);

  const removeItem = useCallback((partId: string) => {
    setItems((prev) => prev.filter((entry) => entry.partId !== partId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPln = items.reduce(
      (sum, item) => sum + item.pricePln * item.quantity,
      0,
    );
    return {
      items,
      ready,
      itemCount,
      totalPln,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
    };
  }, [items, ready, addItem, setQuantity, removeItem, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart musi być użyty wewnątrz CartProvider");
  }
  return ctx;
}
