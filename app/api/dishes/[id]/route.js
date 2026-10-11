import { NextResponse } from "next/server";
import { getDishById } from "@/lib/dishes";

export async function GET(request, { params }) {
  const { id } = await params;
  const dish = getDishById(id);

  if (!dish) {
    return NextResponse.json({ error: `Dish not found: ${id}` }, { status: 404 });
  }

  return NextResponse.json(dish);
}