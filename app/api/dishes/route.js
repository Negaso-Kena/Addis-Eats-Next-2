import { NextResponse } from "next/server";
import { getDishes, searchDishes, getDishesPage } from "@/lib/dishes";

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const page = params.get("page");
  const q = params.get("q");

  if (page !== null) {
    return NextResponse.json(getDishesPage(page));
  }
  if (q !== null) {
    return NextResponse.json(searchDishes(q));
  }
  return NextResponse.json(getDishes());
}