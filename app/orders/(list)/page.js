import Link from "next/link";
import { redirect } from "next/navigation";
import { getAllOrders, getOrdersByUserId } from "@/lib/orders-store";
import { parseSort, sortOrders, paginate } from "@/lib/orders-query";
import { when } from "@/lib/format";
import { getSession } from "@/lib/session";
import OrderTable from "./OrderTable";
import Pager from "./Pager";
import ExportButton from "./ExportButton";
import styles from "./page.module.css";

export const metadata = {
  title: "Your orders",
  description: "View and track orders placed with Addis Eats.",
  alternates: { canonical: "/orders" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function OrdersPage({ searchParams }) {
  const user = await getSession();
  if (!user) redirect("/signin?next=/orders");

  // Scoped to the session: a customer can only ever page through their own.
  const all = user.role === "staff" ? getAllOrders() : getOrdersByUserId(user.id);

  const { sort, dir, page: requested } = parseSort(await searchParams);
  const { rows, page, pages, total } = paginate(sortOrders(all, sort, dir), requested);
  const title = user.role === "staff" ? "All orders" : "Your orders";

  // Everything the person is allowed to see, flattened for the CSV export.
  const exportRows = sortOrders(all, sort, dir).map((o) => ({
    order: o.id,
    placed: when(o.createdAt),
    status: o.status,
    area: o.customer.area,
    items: o.items.map((i) => `${i.quantity} x ${i.name}`).join("; "),
    total_etb: o.total,
  }));

  return (
    <section>
      <h1>{title}</h1>
      {total === 0 ? (
        // The empty state says why, and what to do next.
        <div className={styles.emptyState}>
          <p>No orders yet — browse the menu to place your first.</p>
          <Link href="/menu">Browse the menu</Link>
        </div>
      ) : (
        <>
          <div className={styles.toolbar}>
            <ExportButton rows={exportRows} />
          </div>
          <OrderTable
            orders={rows}
            sort={sort}
            dir={dir}
            caption={`${title}, ${total} in total, sorted by ${sort} ${dir === "asc" ? "ascending" : "descending"}`}
          />
          <Pager page={page} pages={pages} sort={sort} dir={dir} />
        </>
      )}
    </section>
  );
}
