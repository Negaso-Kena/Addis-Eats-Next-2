"use client";

import { useCart } from "@/lib/cart-store";

export default function CartBadge() {
  const { count } = useCart();
  if (count === 0) return null;
  return <span aria-label={`${count} items in cart`}> ({count})</span>;
}