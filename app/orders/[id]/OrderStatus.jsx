"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { useFormStatus } from "react-dom";
import { fetcher } from "@/lib/fetcher";
import { etb } from "@/lib/format";
import { cancelOrder } from "@/app/actions";
import MapPanel from "./MapPanel";
import styles from "./OrderStatus.module.css";

const FINAL = ["Delivered", "Cancelled"];

function CancelButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={styles.cancel} disabled={pending}>
      {pending ? "Cancelling…" : "Cancel order"}
    </button>
  );
}

// Server renders the order (no spinner on arrival). Then, in order of preference:
//   1. server-sent events push each change as it happens,
//   2. if the stream cannot connect or drops, SWR polls every 5 seconds.
// Both write into the same SWR cache entry, so the screen has one source of truth.
export default function OrderStatus({ initial }) {
  const [connection, setConnection] = useState(
    FINAL.includes(initial.status) ? "final" : "connecting"
  );

  const { data, error, mutate } = useSWR(
    `/api/orders/${encodeURIComponent(initial.id)}`,
    fetcher,
    {
      fallbackData: initial,
      revalidateOnMount: false, // the server just rendered it
      refreshInterval: (latest) =>
        FINAL.includes(latest?.status) || connection === "live" ? 0 : 5000,
      refreshWhenHidden: false,
      refreshWhenOffline: false,
    }
  );
  const order = data ?? initial;

  useEffect(() => {
    if (FINAL.includes(initial.status)) return;
    const source = new EventSource(`/api/orders/${encodeURIComponent(initial.id)}/stream`);

    source.onopen = () => setConnection("live");
    source.onmessage = (event) => {
      const next = JSON.parse(event.data);
      mutate(next, { revalidate: false });
      if (FINAL.includes(next.status)) {
        source.close(); // delivered or cancelled: close deliberately
        setConnection("final");
      }
    };
    source.onerror = () => {
      source.close(); // stop the browser retrying forever; fall back to polling
      setConnection((c) => (c === "final" ? c : "polling"));
    };

    // Not optional: an unclosed EventSource survives navigation.
    return () => source.close();
  }, [initial.id, initial.status, mutate]);

  if (error?.status === 401) {
    return (
      <p role="alert">
        Your session has ended. <a href={`/signin?next=/orders/${order.id}`}>Sign in again</a>
      </p>
    );
  }

  const canCancel = !FINAL.includes(order.status) && order.status !== "On the way";
  const indicator = {
    connecting: ["", "Connecting…"],
    live: [styles.dotLive, "Live — updates arrive as they happen."],
    polling: [styles.dotPolling, "Reconnecting — checking every 5 seconds."],
    final: ["", "This order is final."],
  }[connection];

  return (
    <div className={styles.card}>
      <p>
        Status: <strong className={styles.status}>{order.status}</strong>
      </p>
      <p>Estimated arrival: {order.etaLabel}</p>

      <ul className={styles.items}>
        {order.items.map((line) => (
          <li key={line.id}>
            {line.quantity} × {line.name} — {etb.format(line.price * line.quantity)}
          </li>
        ))}
      </ul>

      <p>Delivery: {etb.format(order.deliveryFee)}</p>
      <p>
        <strong>Total: {etb.format(order.total)}</strong>
      </p>

      {error && (
        <p role="status" className={styles.notice}>
          Couldn&apos;t refresh just now — showing the last status we received.{" "}
          <button type="button" className={styles.link} onClick={() => mutate()}>
            Try again
          </button>
        </p>
      )}

      {/* A screen that quietly stops updating looks like nothing has happened. */}
      <p className={styles.connection} role="status" aria-live="polite">
        <span className={`${styles.dot} ${indicator[0]}`} aria-hidden="true" />
        {indicator[1]}
      </p>

      {canCancel && (
        <form action={cancelOrder}>
          <input type="hidden" name="id" value={order.id} />
          <CancelButton />
        </form>
      )}

      <MapPanel order={order} />
    </div>
  );
}
