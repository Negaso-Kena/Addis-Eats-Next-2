"use client";

import { useCart } from "@/lib/cart-store";
import styles from "./AddToCartButton.module.css";

export default function AddToCartButton({ dish }) {
  const { addItem } = useCart();

  if (dish.available === false) {
    return (
      <button type="button" disabled className={styles.button}>
        Unavailable
      </button>
    );
  }

  return (
    <button
      type="button"
      className={styles.button}
      onClick={() =>
        addItem({
          id: dish.id,
          name: dish.name,
          price: dish.price,
          image: dish.image,
          quantity: 1,
        })
      }
    >
      Add to order
    </button>
  );
}
