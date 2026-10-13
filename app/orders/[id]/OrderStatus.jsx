"use client";

import { useEffect, useState } from "react";
import { getOrderStatus } from "@/lib/orderStatus";
import { formatCurrency } from "@/lib/formatCurrency";
import styles from "./OrderStatus.module.css";

export default function OrderStatus({ initial }) {
  const [status, setStatus] = useState(initial.status);

  useEffect(() => {
    if (status === "Delivered") return;

    const updateStatus = () => {
      const latestStatus = getOrderStatus(initial.createdAt);
      setStatus(latestStatus);
    };
    const intervalId = window.setInterval(updateStatus, 5000);
    updateStatus();

    return () => window.clearInterval(intervalId);
  }, [initial.createdAt, status]);

  return (
    <div className={styles.card}>
      <p>
        Status: <strong className={styles.status}>{status}</strong>
      </p>
      <p>Estimated arrival: {initial.etaLabel}</p>

      <ul className={styles.items}>
        {initial.items.map((line) => (
          <li key={line.id}>
            {line.quantity} × {line.name} — {formatCurrency(line.price * line.quantity)}
          </li>
        ))}
      </ul>

      <p>Delivery: {formatCurrency(initial.deliveryFee)}</p>
      <p>
        <strong>Total: {formatCurrency(initial.total)}</strong>
      </p>
    </div>
  );
}