"use client";

import { useCart } from "@/lib/cart-store";

export default function AddToCartButton({ dish }) {
  const { addItem } = useCart();

  if (dish.available === false) {
    return (
      <button type="button" disabled style={{ opacity: 0.5 }}>
        Unavailable
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() =>
        addItem({
          id: dish.id,
          name: dish.name,
          price: dish.price,
          image: dish.image,
          quantity: 1,
        })
      }
      style={{
        marginTop: "0.5rem",
        background: "#8b4513",
        color: "#fff",
        border: "none",
        padding: "0.4rem 0.75rem",
        borderRadius: 4,
        cursor: "pointer",
      }}
    >
      Add to order
    </button>
  );
}