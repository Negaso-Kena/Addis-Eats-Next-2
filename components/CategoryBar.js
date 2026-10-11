"use client";

import { useState } from "react";
import DishList from "./DishList";
import styles from "./CategoryBar.module.css";

const LABELS = {
  all: "All",
  ethiopian: "Ethiopian",
  pizza: "Pizza",
  burgers: "Burgers",
  drinks: "Drinks",
};

export default function CategoryBar({ categories, dishes, lcpDishId }) {
  const [active, setActive] = useState("all");

  const filtered =
    active === "all" ? dishes : dishes.filter((d) => d.category === active);

  const allCats = ["all", ...categories];

  return (
    <div>
      <div className={styles.pills}>
        {allCats.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActive(cat)}
            className={`${styles.pill} ${active === cat ? styles.pillActive : ""}`}
          >
            {LABELS[cat] || cat}
          </button>
        ))}
      </div>
      <p className={styles.count}>{filtered.length} dishes</p>
      <DishList
        dishes={filtered}
        prioritizedDishId={active === "all" ? lcpDishId : undefined}
      />
    </div>
  );
}
