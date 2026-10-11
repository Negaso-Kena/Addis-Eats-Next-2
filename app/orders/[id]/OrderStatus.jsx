"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { formatCurrency } from "@/lib/formatCurrency";
import styles from "./OrderStatus.module.css";

export default function OrderStatus({ id, initial }) {
  const { data: order, error } = useSWR(`/api/orders/${id}`, fetcher, {
    fallbackData: initial, // server data: no spinner on first paint
    // Poll every 5s; stop once delivered, since nothing can change after that.
    refreshInterval: (latest) => (latest?.status === "Delivered" ? 0 : 5000),
  });

  return (
    <div className={styles.card}>
      {error && (
        <p role="alert" className={styles.error}>
          Could not refresh. Showing the last known status.
        </p>
      )}

      <p>
        Status: <strong className={styles.status}>{order.status}</strong>
      </p>
      <p>Estimated arrival: {order.etaLabel}</p>

      <ul className={styles.items}>
        {order.items.map((line) => (
          <li key={line.id}>
            {line.quantity} × {line.name} — {formatCurrency(line.price * line.quantity)}
          </li>
        ))}
      </ul>

      <p>Delivery: {formatCurrency(order.deliveryFee)}</p>
      <p>
        <strong>Total: {formatCurrency(order.total)}</strong>
      </p>
    </div>
  );
}