"use client";

import { toCsv, downloadCsv } from "@/lib/csv";
import styles from "./page.module.css";

// Rows are already shaped on the server (plain strings and numbers), so the
// browser only turns them into a file. Fine for hundreds of rows; past a few
// thousand, stream it from a route handler instead.
export default function ExportButton({ rows }) {
  return (
    <button
      type="button"
      className={styles.exportButton}
      disabled={rows.length === 0}
      onClick={() => downloadCsv(toCsv(rows), "addis-eats-orders.csv")}
    >
      Export {rows.length} {rows.length === 1 ? "order" : "orders"} (CSV)
    </button>
  );
}
