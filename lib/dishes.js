import { readFileSync } from "fs";
import { join } from "path";

let cached = null;

function loadDishes() {
  if (cached) return cached;
  const path = join(process.cwd(), "public", "menu-data.json");
  const raw = readFileSync(path, "utf8");
  cached = JSON.parse(raw).map((d) => ({
    ...d,
    image: d.image?.startsWith("/") ? d.image : `/${d.image}`,
  }));
  return cached;
}

export const CATEGORIES = ["ethiopian", "pizza", "burgers", "drinks"];

export function getDishes() {
  return loadDishes();
}

export function getDishById(id) {
  return loadDishes().find((d) => String(d.id) === String(id)) ?? null;
}

export function getSpecials() {
  return loadDishes().filter((d) => d.popular && d.available !== false);
}

export function getAvailableDishes() {
  return loadDishes().filter((d) => d.available !== false);
}

export function getDishesByCategory(category) {
  const list = getAvailableDishes();
  if (!category || category === "all") return list;
  return list.filter((d) => d.category === category);
}


export function searchDishes(query) {
  const q = String(query ?? "").trim().toLowerCase();
  if (!q) return getAvailableDishes();

  return getAvailableDishes().filter((d) =>
    [d.name, d.description, d.category, ...(d.ingredients ?? [])]
      .join(" ")
      .toLowerCase()
      .includes(q)
  );
}

export const PAGE_SIZE = 6;

export function getDishesPage(page) {
  const all = getAvailableDishes();
  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const current = Math.min(Math.max(1, Number.parseInt(page, 10) || 1), totalPages);
  const start = (current - 1) * PAGE_SIZE;

  return {
    items: all.slice(start, start + PAGE_SIZE),
    page: current,
    pageSize: PAGE_SIZE,
    totalPages,
    total: all.length,
  };
}