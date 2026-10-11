"use client";

import { CartProvider } from "@/lib/cart-store";

export default function Providers({ children }) {
  return <CartProvider>{children}</CartProvider>;
}