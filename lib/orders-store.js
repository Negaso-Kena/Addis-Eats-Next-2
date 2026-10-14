import { getOrderStatus } from "./orderStatus";
import { buildDemoOrders } from "./demo-orders";

// In-memory store. Kept on globalThis so pages, server actions and route
// handlers all share ONE array — module-level variables can be duplicated
// across Next.js bundles. Still resets on a full server restart; a real
// app would persist orders to a database.
const g = globalThis;
g.__addisEatsOrders ??= { orders: [], nextId: 2048 };
const store = g.__addisEatsOrders;

// Optional demo data for the dashboard (see lib/demo-orders.js). Off unless
// SEED_DEMO_ORDERS=true, and only ever added once per server process.
if (process.env.SEED_DEMO_ORDERS === "true" && !g.__addisEatsSeeded) {
  g.__addisEatsSeeded = true;
  store.orders.push(...buildDemoOrders());
}

function withLiveStatus(order) {
  // Cancelled is terminal: time must never turn it back into "Delivered".
  const status =
    order.status === "Cancelled" ? "Cancelled" : getOrderStatus(order.createdAt);
  return { ...order, status };
}

export function saveOrder(order) {
  // Idempotent: the same user submitting the same requestId again (an impatient
  // double tap, a retry on a slow connection) gets the order they already
  // placed. Per server process, like every order here.
  if (order.requestId) {
    const existing = store.orders.find(
      (o) => o.userId === order.userId && o.requestId === order.requestId
    );
    if (existing) return withLiveStatus(existing);
  }
  const id = `AE-${store.nextId++}`;
  const record = {
    id,
    createdAt: new Date().toISOString(),
    userId: order.userId ?? null, // ← new field
    ...order,
  };
  store.orders.unshift(record);
  return withLiveStatus(record);
}

export function getOrderForUser(id, userId, isStaff = false) {
  const order = store.orders.find(
    (candidate) =>
      candidate.id === id && (isStaff || candidate.userId === userId)
  );
  return order ? withLiveStatus(order) : null;
}

export function getAllOrders() {
  return store.orders.map(withLiveStatus);
}

export function getOrdersByUserId(userId) {
  return store.orders
    .filter((o) => o.userId === userId)
    .map(withLiveStatus);
}

// Ownership is part of the lookup itself: a customer can only ever find
// their own record, so there is no id they can send that reaches another's.
export function cancelOrderForUser(id, userId, isStaff = false) {
  const record = store.orders.find(
    (order) => order.id === id && (isStaff || order.userId === userId)
  );
  if (!record) return { ok: false, reason: "not_found" };

  const current = withLiveStatus(record);
  if (current.status === "Cancelled") return { ok: true, order: current };
  if (current.status === "On the way" || current.status === "Delivered") {
    return { ok: false, reason: "too_late" };
  }

  record.status = "Cancelled";
  return { ok: true, order: withLiveStatus(record) };
}
