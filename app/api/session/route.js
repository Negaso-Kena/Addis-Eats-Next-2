import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

// Exists specifically because a client component (AuthNav/KitchenLink below)
// needs this data and can't call a server-only cookies() read directly —
// the brief's own stated exception to "don't build an endpoint you don't need."
export async function GET() {
  const user = await getSession();
  return NextResponse.json({ user });
}