"use client";

import { useCart } from "@/components/cart-provider";

export function CartBadge() {
  const { itemCount, ready } = useCart();
  if (!ready || itemCount === 0) {
    return null;
  }
  return <span className="cart-badge">{itemCount}</span>;
}
