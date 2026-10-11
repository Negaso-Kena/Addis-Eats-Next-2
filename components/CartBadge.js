"use client";

import { useCart } from "@/lib/cart-store";
import styles from "./CartBadge.module.css";

export default function CartBadge() {
  const { count } = useCart();
  if (count === 0) return null;
  return (
    <span className={styles.badge} aria-label={`${count} items in cart`}>
      {count}
    </span>
  );
}
