"use client";

import { CartProvider } from "@/lib/cart-store";
import { ThemeProvider } from "./ThemeContext";

export default function Providers({ children }) {
  return (
    <ThemeProvider>
      <CartProvider>{children}</CartProvider>
    </ThemeProvider>
  );
}