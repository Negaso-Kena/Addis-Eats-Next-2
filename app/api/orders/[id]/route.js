import { NextResponse } from "next/server";
import { getOrderForUser } from "@/lib/orders-store";
import { getSession } from "@/lib/session";
import { privateNoStoreHeaders } from "@/lib/cacheHeaders";

export async function GET(request, { params }) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json(
      { error: "Not signed in." },
      { status: 401, headers: privateNoStoreHeaders }
    );
  }
  const { id } = await params;
  const order = getOrderForUser(id, user.id, user.role === "staff");
  if (!order) {
    return NextResponse.json(
      { error: `Order not found: ${id}` },
      { status: 404, headers: privateNoStoreHeaders }
    );
  }

  return NextResponse.json(order, { headers: privateNoStoreHeaders });
}