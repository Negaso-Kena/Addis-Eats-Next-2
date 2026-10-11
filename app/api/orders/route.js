import { NextResponse } from "next/server";
import { orderSchema } from "@/lib/validation";
import { getDishById } from "@/lib/dishes";
import { getDeliveryEstimate } from "@/lib/delivery";
import { saveOrder, getAllOrders, getOrdersByUserId } from "@/lib/orders-store";
import { getSession } from "@/lib/session";

// For callers outside our own UI (curl, a future client). Our own pages
// never fetch this — they use the server action or read lib/orders-store
// directly, per the brief's "the endpoint you do not need" warning.
export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const orders =
    user.role === "staff" ? getAllOrders() : getOrdersByUserId(user.id);
  return NextResponse.json(orders);
}

export async function POST(request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { name, phone, area, note, items } = parsed.data;

  const lineItems = [];
  for (const line of items) {
    const dish = getDishById(line.id);
    if (!dish) {
      return NextResponse.json({ error: `Unknown dish id: ${line.id}` }, { status: 422 });
    }
    lineItems.push({ id: dish.id, name: dish.name, price: dish.price, quantity: line.quantity });
  }

  const subtotal = lineItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const { fee: deliveryFee, etaLabel } = getDeliveryEstimate(area);
  const total = subtotal + deliveryFee;

  const order = saveOrder({
    userId: user.id,
    customer: { name, phone, area, note },
    items: lineItems,
    subtotal,
    deliveryFee,
    etaLabel,
    total,
    status: "Pending",
  });

  return NextResponse.json(order, { status: 201 });
}