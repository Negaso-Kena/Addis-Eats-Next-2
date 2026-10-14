"use client";

import dynamic from "next/dynamic";
import { getArea } from "@/lib/delivery";
import styles from "./OrderStatus.module.css";

// Leaflet touches `window` the moment it loads, so it can never be imported on
// the server. ssr:false is not an optimisation here — it is the only way it loads.
const DeliveryMap = dynamic(() => import("./DeliveryMap"), {
  ssr: false,
  // Exactly the map's height, so the page does not jump when it arrives.
  loading: () => <div className={styles.mapPlaceholder} aria-hidden="true" />,
});

const WHERE = {
  Pending: "Your order has been received and is waiting for the kitchen.",
  Preparing: "The kitchen is preparing your order.",
  "On the way": "A courier is on the way to you.",
  Delivered: "Your order has been delivered.",
  Cancelled: "This order was cancelled.",
};

export default function MapPanel({ order }) {
  const area = getArea(order.customer.area);
  return (
    <section aria-labelledby="map-heading" className={styles.mapPanel}>
      <h2 id="map-heading">Delivery map</h2>
      {/* A map is not accessible: the same information, in words. */}
      <p>
        Delivering to <strong>{area.label}</strong>. {WHERE[order.status]} Estimated arrival:{" "}
        {order.etaLabel}.
      </p>
      <div className={styles.mapBox}>
        <DeliveryMap order={order} />
      </div>
      <p className={styles.mapNote}>
        Courier position is simulated for this demo. Map data © OpenStreetMap contributors.
      </p>
    </section>
  );
}
