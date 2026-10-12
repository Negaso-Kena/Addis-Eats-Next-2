import { NextResponse } from "next/server";
import { getDishes, searchDishes, getDishesPage } from "@/lib/dishes";
import { publicDishCacheHeaders } from "@/lib/cacheHeaders";

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const page = params.get("page");
  const q = params.get("q");

  if (page !== null) {
    return NextResponse.json(getDishesPage(page), {
      headers: publicDishCacheHeaders,
    });
  }
  if (q !== null) {
    return NextResponse.json(searchDishes(q), {
      headers: publicDishCacheHeaders,
    });
  }
  return NextResponse.json(getDishes(), { headers: publicDishCacheHeaders });
}