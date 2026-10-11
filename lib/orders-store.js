// In-memory store. Kept on globalThis so pages, server actions and route
// handlers all share ONE array — module-level variables can be duplicated
// across Next.js bundles. Still resets on a full server restart; a real
// app would persist orders to a database.
const g = globalThis;
g.__addisEatsOrders ??= { orders: [], nextId: 2048 };
const store = g.__addisEatsOrders;

// There is no real kitchen, so status is derived from the order's age.
// Short timings on purpose, so polling visibly changes during a demo.
const STAGES = [
  { fromSeconds: 90, label: "Delivered" },
  { fromSeconds: 45, label: "On the way" },
  { fromSeconds: 15, label: "Preparing" },
  { fromSeconds: 0, label: "Pending" },
];

function statusFor(createdAt) {
  const age = (Date.now() - new Date(createdAt).getTime()) / 1000;
  return STAGES.find((s) => age >= s.fromSeconds).label;
}

function withLiveStatus(order) {
  return { ...order, status: statusFor(order.createdAt) };
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