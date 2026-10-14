import { getDishById } from "./dishes";
import { getDeliveryEstimate } from "./delivery";

// Clearly labelled demo data so the Day 46 dashboard has something to show.
// Enabled only when SEED_DEMO_ORDERS=true. Every record carries demo: true,
// a "Demo" customer name and no owner, so no customer account can open them.
const DEMO = [
  { daysAgo: 0, hour: 9, area: "bole", items: [[1, 2], [5, 1]] },
  { daysAgo: 0, hour: 13, area: "piazza", items: [[2, 1]] },
  { daysAgo: 1, hour: 12, area: "megenagna", items: [[3, 2], [8, 2]] },
  { daysAgo: 2, hour: 19, area: "bole", items: [[1, 1], [4, 1]] },
  { daysAgo: 3, hour: 14, area: "cmc", items: [[8, 3]] },
  { daysAgo: 4, hour: 20, area: "sarbet", items: [[2, 2], [9, 1]] },
  { daysAgo: 5, hour: 11, area: "bole", items: [[7, 1]] },
  { daysAgo: 6, hour: 18, area: "piazza", items: [[1, 2]], cancelled: true },
  { daysAgo: 7, hour: 13, area: "megenagna", items: [[5, 2], [3, 1]] },
  { daysAgo: 9, hour: 19, area: "cmc", items: [[4, 2]] },
];

export function buildDemoOrders(now = Date.now()) {
  return DEMO.map((spec, index) => {
    const items = spec.items
      .map(([id, quantity]) => {
        const dish = getDishById(String(id));
        return dish ? { id: dish.id, name: dish.name, price: dish.price, quantity } : null;
      })
      .filter(Boolean);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const { fee, etaLabel } = getDeliveryEstimate(spec.area);
    const placed = new Date(now - spec.daysAgo * 86400000);
    placed.setUTCHours(spec.hour - 3, 0, 0, 0); // hour in Addis time (UTC+3)
    return {
      id: `AE-DEMO-${String(index + 1).padStart(2, "0")}`,
      createdAt: placed.toISOString(),
      userId: null,
      demo: true,
      customer: { name: "Demo customer", phone: "0900 000 000", area: spec.area, note: "Demo data" },
      items,
      subtotal,
      deliveryFee: fee,
      etaLabel,
      total: subtotal + fee,
      status: spec.cancelled ? "Cancelled" : "Pending", // old orders resolve to Delivered
    };
  }).filter((o) => o.items.length > 0);
}
