"use client";

import { useCart } from "@/lib/cart-store";
import { placeOrder } from "@/app/actions";
import { DELIVERY_AREAS } from "@/lib/delivery";
import { formatCurrency } from "@/lib/formatCurrency";
import styles from "./CheckoutForm.module.css";

export default function CheckoutForm({ error }) {
  const { items, total } = useCart();
  const checkoutItems = items;
  const subtotal = total;

  if (checkoutItems.length === 0) {
    return <p className={styles.emptyNote}>Your cart is empty — add something from the menu first.</p>;
  }

  return (
    <form action={placeOrder} className={styles.form}>
      {/* Real cart items travel as a genuine form field, so submitting
          this form — even with JS disabled — still places a real order. */}
      <input
        type="hidden"
        name="items"
        value={JSON.stringify(checkoutItems.map((i) => ({ id: i.id, quantity: i.quantity })))}
      />

      <div className={styles.field}>
        <label htmlFor="name">Full name</label>
        <input id="name" name="name" required />
        {error?.field === "name" && <p className={styles.error}>{error.message}</p>}
      </div>

      <div className={styles.field}>
        <label htmlFor="phone">Phone number</label>
        <input id="phone" name="phone" type="tel" placeholder="0912 345 678" required />
        {error?.field === "phone" && <p className={styles.error}>{error.message}</p>}
      </div>

      <div className={styles.field}>
        <label htmlFor="area">Delivery area</label>
        <select id="area" name="area" required defaultValue="">
          <option value="" disabled>
            Select an area
          </option>
          {DELIVERY_AREAS.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
        {error?.field === "area" && <p className={styles.error}>{error.message}</p>}
      </div>

      <div className={styles.field}>
        <label htmlFor="note">Special instructions (optional)</label>
        <textarea id="note" name="note" rows={2} />
      </div>

      {error?.field === "form" && <p className={styles.error}>{error.message}</p>}

      <div className={styles.subtotal}>
        <span>Subtotal</span>
        <strong>{formatCurrency(subtotal)}</strong>
      </div>
      <p className={styles.hint}>Delivery fee is added once you pick an area.</p>

      <button type="submit" className={styles.submit}>
        Place order
      </button>
    </form>
  );
}