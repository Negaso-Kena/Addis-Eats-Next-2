"use client";

import { useState } from "react";
import DishList from "./DishList";

const LABELS = {
  all: "All",
  ethiopian: "Ethiopian",
  pizza: "Pizza",
  burgers: "Burgers",
  drinks: "Drinks",
};

export default function CategoryBar({ categories, dishes }) {
  const [active, setActive] = useState("all");

  const filtered =
    active === "all"
      ? dishes
      : dishes.filter((d) => d.category === active);

  const allCats = ["all", ...categories];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "180px 1fr",
        gap: "1.5rem",
      }}
    >
      <aside>
        <h2 style={{ fontSize: "1rem" }}>Categories</h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {allCats.map((cat) => (
            <li key={cat} style={{ marginBottom: 4 }}>
              <button
                type="button"
                onClick={() => setActive(cat)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "0.4rem 0.6rem",
                  border: "1px solid #ddd",
                  borderRadius: 4,
                  background: active === cat ? "#8b4513" : "#fff",
                  color: active === cat ? "#fff" : "#111",
                  cursor: "pointer",
                }}
              >
                {LABELS[cat] || cat}
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <div>
        <p style={{ color: "#666" }}>{filtered.length} dishes</p>
        <DishList dishes={filtered} />
      </div>
    </div>
  );
}

// client — local state, keeps /menu off searchParams