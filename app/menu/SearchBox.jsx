"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { useDebounce } from "@/lib/useDebounce";
import CategoryBar from "@/components/CategoryBar";
import DishList from "./DishList";
import styles from "./SearchBox.module.css";

export default function SearchBox({ categories, dishes, lcpDishId }) {
  const [term, setTerm] = useState("");
  const debounced = useDebounce(term.trim(), 300);
  const normalizedQuery = debounced.toLowerCase();
  const searchSeed = normalizedQuery
    ? dishes.filter(
        (dish) =>
          dish.available !== false &&
          [dish.name, dish.description, dish.category, ...(dish.ingredients ?? [])]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery)
      )
    : undefined;

  // null key while the term is empty: SWR does not fetch at all.
  // Server-provided dishes seed each search while SWR revalidates the API.
  const { data, error, isValidating } = useSWR(
    debounced ? `/api/dishes?q=${encodeURIComponent(debounced)}` : null,
    fetcher,
    { fallbackData: searchSeed, keepPreviousData: true }
  );

  const showSearch = debounced !== "";

  return (
    <div>
      <label htmlFor="menu-search" className={styles.label}>
        Search the menu
      </label>
      <input
        id="menu-search"
        type="search"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Try “tibs” or “pizza”"
        className={styles.search}
      />

      {!showSearch ? (
        <CategoryBar
          categories={categories}
          dishes={dishes}
          lcpDishId={lcpDishId}
        />
      ) : error ? (
        <p role="alert" className={styles.message}>
          Search failed. Please try again.
        </p>
      ) : !data ? (
        <p>Searching…</p>
      ) : (
        <div>
          <p className={styles.meta}>
            {data.length} {data.length === 1 ? "dish" : "dishes"}
            {isValidating ? " · updating…" : ""}
          </p>
          {data.length === 0 ? (
            <p>No dishes match “{debounced}”.</p>
          ) : (
            <div className={`${styles.results} ${isValidating ? styles.updating : ""}`}>
              <DishList dishes={data} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}