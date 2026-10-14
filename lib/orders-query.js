// Pure helpers: sort and page an array of orders. Kept free of any request
// or store access so they are trivial to reason about and to test.
export const PAGE_SIZE = 8;

export const SORTABLE = ["date", "total", "status"];

const STATUS_RANK = {
  Pending: 0,
  Preparing: 1,
  "On the way": 2,
  Delivered: 3,
  Cancelled: 4,
};

// Never trust the URL: anything outside the whitelist falls back to the default.
export function parseSort(searchParams) {
  const sort = SORTABLE.includes(searchParams?.sort) ? searchParams.sort : "date";
  const dir = searchParams?.dir === "asc" ? "asc" : "desc";
  const page = Number(searchParams?.page);
  return { sort, dir, page: Number.isInteger(page) && page >= 1 ? page : 1 };
}

export function sortOrders(orders, sort, dir) {
  const value = {
    date: (o) => new Date(o.createdAt).getTime(),
    total: (o) => o.total,
    status: (o) => STATUS_RANK[o.status] ?? 99,
  }[sort];
  const factor = dir === "asc" ? 1 : -1;
  return [...orders].sort((a, b) => (value(a) - value(b)) * factor);
}

export function paginate(orders, requestedPage) {
  const pages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));
  const page = Math.min(requestedPage, pages); // clamp page=999
  const start = (page - 1) * PAGE_SIZE;
  return { rows: orders.slice(start, start + PAGE_SIZE), page, pages, total: orders.length };
}
