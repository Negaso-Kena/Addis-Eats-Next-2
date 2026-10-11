"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-store";
import { formatCurrency } from "@/lib/formatCurrency";
import styles from "./CartView.module.css";

export default function CartView() {
  const { items, removeItem, increment, decrement, total, clear } = useCart();

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <p>Your cart is empty.</p>
        <Link href="/menu" className={styles.browseLink}>
          Browse the menu →
        </Link>
      </div>
    );
  }

  return (
    <div>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.id} className={styles.row}>
            {item.image && (
              <Image
                src={item.image}
                alt={`${item.name} in your cart`}
                width={56}
                height={56}
                sizes="56px"
                quality={60}
                className={styles.image}
              />
            )}
            <div className={styles.info}>
              <strong>{item.name}</strong>
              <span className={styles.unitPrice}>{formatCurrency(item.price)}</span>
            </div>
            <div className={styles.stepper}>
              <button type="button" onClick={() => decrement(item.id)} aria-label="Decrease quantity">
                −
              </button>
              <span>{item.quantity}</span>
              <button type="button" onClick={() => increment(item.id)} aria-label="Increase quantity">
                +
              </button>
            </div>
            <span className={styles.lineTotal}>{formatCurrency(item.price * item.quantity)}</span>
            <button type="button" className={styles.remove} onClick={() => removeItem(item.id)}>
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className={styles.summary}>
        <span>Total</span>
        <strong>{formatCurrency(total)}</strong>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.clearBtn} onClick={clear}>
          Clear cart
        </button>
        <Link href="/checkout" className={styles.checkoutBtn}>
          Checkout
        </Link>
      </div>
    </div>
  );
}
