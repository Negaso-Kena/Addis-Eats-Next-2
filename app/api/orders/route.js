import { NextResponse } from "next/server";
import { createOrderForUser } from "@/lib/order-service";
import { getAllOrders, getOrdersByUserId } from "@/lib/orders-store";
import { getSession } from "@/lib/session";
import { privateNoStoreHeaders } from "@/lib/cacheHeaders";

// For callers outside our own UI (curl, a future client). Our own pages
// never fetch this — they use the server action or read lib/orders-store
// directly, per the brief's "the endpoint you do not need" warning.
export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json(
      { error: "Not signed in." },
      { status: 401, headers: privateNoStoreHeaders }
    );
  }

  const orders =
    user.role === "staff" ? getAllOrders() : getOrdersByUserId(user.id);
  return NextResponse.json(orders, { headers: privateNoStoreHeaders });
}

export async function POST(request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json(
      { error: "Not signed in." },
      { status: 401, headers: privateNoStoreHeaders }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400, headers: privateNoStoreHeaders }
    );
  }

  // Same validation and pricing as the server action — one shared service.
  const result = createOrderForUser(user, body);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, fieldErrors: result.fieldErrors },
      { status: result.status, headers: privateNoStoreHeaders }
    );
  }

  return NextResponse.json(result.order, {
    status: 201,
    headers: privateNoStoreHeaders,
  });
}
