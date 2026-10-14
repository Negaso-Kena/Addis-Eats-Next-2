import Link from "next/link";
import { etb, when } from "@/lib/format";
import styles from "./page.module.css";

// A server component: a read-only table has no state and no handlers, so it
// ships no JavaScript. Real table markup — caption, thead, th scope — is what
// makes it accessible, copyable and printable.
function SortHeader({ label, field, sort, dir, align }) {
  const active = sort === field;
  const nextDir = active && dir === "desc" ? "asc" : "desc";
  return (
    <th
      scope="col"
      className={align === "right" ? styles.num : undefined}
      aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
    >
      {/* Sorting lives in the URL: shareable, survives refresh, back button works. */}
      <Link href={`/orders?sort=${field}&dir=${nextDir}`} className={styles.sortLink}>
        {label}
        <span aria-hidden="true">{active ? (dir === "asc" ? " ▲" : " ▼") : ""}</span>
      </Link>
    </th>
  );
}

export default function OrderTable({ orders, sort, dir, caption }) {
  return (
    <div className={styles.tableWrap} role="region" aria-label={caption} tabIndex={0}>
      <table className={styles.table}>
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Order</th>
            <SortHeader label="Placed" field="date" sort={sort} dir={dir} />
            <SortHeader label="Status" field="status" sort={sort} dir={dir} />
            <th scope="col" className={styles.num}>Items</th>
            <SortHeader label="Total" field="total" sort={sort} dir={dir} align="right" />
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const count = order.items.reduce((n, i) => n + i.quantity, 0);
            return (
              <tr key={order.id}>
                <th scope="row">
                  <Link href={`/orders/${order.id}`}>{order.id}</Link>
                  {order.demo && <span className={styles.badge}>Demo</span>}
                </th>
                <td>{when(order.createdAt)}</td>
                <td>{order.status}</td>
                <td className={styles.num}>{count}</td>
                <td className={styles.num}>{etb.format(order.total)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
