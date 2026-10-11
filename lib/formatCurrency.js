export function formatCurrency(amount) {
  if (typeof amount !== "number" || Number.isNaN(amount)) {
    return "— ETB";
  }
  return `${amount.toLocaleString("en-US")} ETB`;
}