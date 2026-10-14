import { etb } from "./format";

// Kept so existing imports keep working; the single source of truth is lib/format.js.
export function formatCurrency(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return "— ETB";
  return etb.format(value);
}
