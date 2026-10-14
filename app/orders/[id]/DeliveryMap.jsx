"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css"; // without it the map renders as broken tiles
import { KITCHEN, getArea } from "@/lib/delivery";

// Leaflet's default pin images do not survive bundling, so draw our own pins.
const pin = (emoji) =>
  L.divIcon({
    className: "",
    html: `<div style="width:34px;height:34px;display:grid;place-items:center;font-size:20px;background:#fff;border:2px solid #1f6f50;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,.35)">${emoji}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });

const ICONS = { kitchen: pin("🍲"), courier: pin("🛵"), home: pin("🏠") };
const lerp = (a, b, t) => a + (b - a) * t;

// Simulated courier: at the kitchen until "On the way", then it moves along the
// straight line to the address as the order ages from 45s to 90s (see
// lib/orderStatus.js). Replace with real courier coordinates when they exist.
function progressFor(order, now) {
  if (order.status === "Delivered") return 1;
  if (order.status !== "On the way") return 0;
  const age = (now - new Date(order.createdAt).getTime()) / 1000;
  return Math.min(1, Math.max(0, (age - 45) / 45));
}

export default function DeliveryMap({ order }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (order.status !== "On the way") return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [order.status]);

  const area = getArea(order.customer.area);
  const t = progressFor(order, now);
  const courier = [lerp(KITCHEN.lat, area.lat, t), lerp(KITCHEN.lng, area.lng, t)];
  const kitchen = [KITCHEN.lat, KITCHEN.lng];
  const home = [area.lat, area.lng];

  return (
    <MapContainer
      bounds={[kitchen, home]}
      boundsOptions={{ padding: [48, 48] }}
      style={{ height: "320px", width: "100%" }}
      scrollWheelZoom={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />
      <Polyline positions={[kitchen, home]} pathOptions={{ dashArray: "6 8", weight: 3 }} />
      <Marker position={kitchen} icon={ICONS.kitchen}>
        <Popup>{KITCHEN.name}</Popup>
      </Marker>
      <Marker position={home} icon={ICONS.home}>
        <Popup>Delivery: {area.label}</Popup>
      </Marker>
      <Marker position={courier} icon={ICONS.courier}>
        <Popup>Courier · {order.status}</Popup>
      </Marker>
    </MapContainer>
  );
}
