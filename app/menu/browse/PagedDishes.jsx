"use client";

import useSWR from "swr";
import { useSearchParams } from "next/navigation";
import { fetcher } from "@/lib/fetcher";
import DishList from "../DishList";
import styles from "./PagedDishes.module.css";

export default function PagedDishes({ initial }) {
  const searchParams = useSearchParams();
  const page = Math.max(1, Number.parseInt(searchParams.get("page"), 10) || 1);

  const { data, error, isValidating } = useSWR(`/api/dishes?page=${page}`, fetcher, {
    // The server's data is valid for ONE page only.
    fallbackData: page === initial.page ? initial : undefined,
    keepPreviousData: true, // hold the old page while the next one loads
  });

  // Plain clicks update the URL without a server round trip.
  // Ctrl/Cmd/Shift-click still opens the link normally.
  function onPageClick(e, target) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    window.history.pushState(null, "", `?page=${target}`);
  }

  if (error && !data) {
    return (
      <p role="alert" style={{ color: "var(--danger)" }}>
        Could not load dishes. Please try again.
      </p>
    );
  }

  if (!data) return <p>Loading…</p>;

  const prev = data.page - 1;
  const next = data.page + 1;

  return (
    <div>
      <p className={styles.meta}>
        {data.total} dishes · page {data.page} of {data.totalPages}
        {isValidating ? " · updating…" : ""}
      </p>

      <div className={`${styles.results} ${isValidating ? styles.updating : ""}`}>
        <DishList dishes={data.items} />
      </div>

      <nav aria-label="Pages" className={styles.pagination}>
        {prev >= 1 ? (
          <a href={`?page=${prev}`} onClick={(e) => onPageClick(e, prev)}>
            ← Previous
          </a>
        ) : (
          <span className={styles.disabled}>← Previous</span>
        )}
        {next <= data.totalPages ? (
          <a href={`?page=${next}`} onClick={(e) => onPageClick(e, next)}>
            Next →
          </a>
        ) : (
          <span className={styles.disabled}>Next →</span>
        )}
      </nav>
    </div>
  );
}