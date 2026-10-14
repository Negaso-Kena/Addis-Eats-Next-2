"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { createOrderForUser } from "@/lib/order-service";
import { cancelOrderForUser } from "@/lib/orders-store";

export async function placeOrder(formData) {
  // 1. Authentication — who is asking? Refuse at the point of effect.
  const user = await getSession();
  if (!user) throw new Error("Not signed in");

  const result = createOrderForUser(user, {
    name: formData.get("name") ?? "",
    phone: formData.get("phone") ?? "",
    area: formData.get("area") ?? "",
    note: formData.get("note") ?? "",
    items: safeParseItems(formData.get("items")),
    ...(formData.get("requestId") ? { requestId: String(formData.get("requestId")) } : {}),
  });

  if (!result.ok) {
    const errors = result.fieldErrors ?? {};
    const field = Object.keys(errors).find((key) => errors[key]?.length) ?? "form";
    const message = errors[field]?.[0] ?? result.error;
    // Item problems are shown as a form-level message.
    const shown = field === "items" ? "form" : field;
    redirect(
      `/checkout?error=1&field=${encodeURIComponent(shown)}&message=${encodeURIComponent(message)}`
    );
  }

  revalidatePath("/orders");
  revalidatePath("/kitchen");
  redirect(`/checkout?order=${result.order.id}`);
}

// Authentication AND authorisation, both inside the write. A customer can
// only reach their own orders (the store lookup is scoped); staff may cancel
// any. Nothing here trusts a role or user id supplied by the browser.
export async function cancelOrder(formData) {
  const user = await getSession();
  if (!user) throw new Error("Not signed in");

  const id = String(formData.get("id") ?? "");
  const result = cancelOrderForUser(id, user.id, user.role === "staff");
  if (!result.ok && result.reason === "not_found") {
    throw new Error("Order not found");
  }

  revalidatePath("/orders");
  revalidatePath("/kitchen");
  revalidatePath(`/orders/${id}`);
  redirect(`/orders/${encodeURIComponent(id)}${result.ok ? "" : "?notice=too_late"}`);
}

function safeParseItems(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(String(raw));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
