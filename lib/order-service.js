import { z } from "zod";
import { orderSchema } from "./validation";
import { getDishById } from "./dishes";
import { getDeliveryEstimate } from "./delivery";
import { saveOrder } from "./orders-store";

// The one place an order is created. The server action and POST /api/orders
// both call this, so the rules cannot drift apart. The caller supplies the
// verified user; nothing about identity, price or fees is read from `raw`.
export function createOrderForUser(user, raw) {
  if (!user) return { ok: false, status: 401, error: "Not signed in." };

  const parsed = orderSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      status: 422,
      error: "Validation failed.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { name, phone, area, note, items, requestId } = parsed.data;

  // Combine duplicate lines, then cap the combined quantity.
  const quantities = new Map();
  for (const line of items) {
    const id = String(line.id);
    quantities.set(id, (quantities.get(id) ?? 0) + line.quantity);
  }

  const lineItems = [];
  for (const [id, quantity] of quantities) {
    const dish = getDishById(id);
    if (!dish || dish.available === false || quantity > 20) {
      return {
        ok: false,
        status: 422,
        error: "One of the items in your cart is unavailable.",
        fieldErrors: { form: ["One of the items in your cart is unavailable."] },
      };
    }
    lineItems.push({ id: dish.id, name: dish.name, price: dish.price, quantity });
  }

  const subtotal = lineItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const { fee: deliveryFee, etaLabel } = getDeliveryEstimate(area);

  const order = saveOrder({
    userId: user.id, // from the session, never from the request
    customer: { name, phone, area, note },
    items: lineItems,
    subtotal,
    deliveryFee,
    etaLabel,
    total: subtotal + deliveryFee,
    status: "Pending",
    requestId,
  });

  return { ok: true, order };
}
