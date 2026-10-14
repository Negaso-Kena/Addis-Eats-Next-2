import { DELIVERY_AREAS } from "./delivery";
import { dayKey, dayLabel } from "./format";

const DAY_MS = 24 * 60 * 60 * 1000;
export const RANGE_DAYS = 14;

// Shape the data on the server so only a handful of rows cross to the browser.
// Cancelled orders are not revenue and are left out of both charts.
export function summarise(orders, now = Date.now()) {
  const live = orders.filter((o) => o.status !== "Cancelled");

  const revenueByArea = DELIVERY_AREAS.map((area) => {
    const inArea = live.filter((o) => o.customer.area === area.value);
    return {
      area: area.label.split(" - ")[0], // "Bole - Woreda 03" -> "Bole"
      orders: inArea.length,
      revenue: inArea.reduce((sum, o) => sum + o.total, 0),
    };
  });

  const days = Array.from({ length: RANGE_DAYS }, (_, i) => {
    const date = new Date(now - (RANGE_DAYS - 1 - i) * DAY_MS);
    return { key: dayKey(date), day: dayLabel(date), orders: 0 };
  });
  for (const order of live) {
    const slot = days.find((d) => d.key === dayKey(new Date(order.createdAt)));
    if (slot) slot.orders += 1;
  }

  return {
    revenueByArea,
    ordersPerDay: days.map(({ day, orders }) => ({ day, orders })),
    totalOrders: live.length,
    totalRevenue: live.reduce((sum, o) => sum + o.total, 0),
    cancelled: orders.length - live.length,
    hasDemo: orders.some((o) => o.demo),
  };
}
