const STAGES = [
  { fromSeconds: 90, label: "Delivered" },
  { fromSeconds: 45, label: "On the way" },
  { fromSeconds: 15, label: "Preparing" },
  { fromSeconds: 0, label: "Pending" },
];

export function getOrderStatus(createdAt) {
  const age = (Date.now() - new Date(createdAt).getTime()) / 1000;
  return STAGES.find((stage) => age >= stage.fromSeconds)?.label ?? "Pending";
}
