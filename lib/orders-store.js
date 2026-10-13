import { getOrderStatus } from "./orderStatus";

// In-memory store. Kept on globalThis so pages, server actions and route
// handlers all share ONE array — module-level variables can be duplicated
// across Next.js bundles. Still resets on a full server restart; a real
// app would persist orders to a database.
const g = globalThis;
g.__addisEatsOrders ??= { orders: [], nextId: 2048 };
const store = g.__addisEatsOrders;

function withLiveStatus(order) {
  return { ...order, status: getOrderStatus(order.createdAt) };
}

export function saveOrder(order) {
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