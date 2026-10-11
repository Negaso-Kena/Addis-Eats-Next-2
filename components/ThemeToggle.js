"use client";

import { useTheme } from "./ThemeContext";
import styles from "./ThemeToggle.module.css";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={styles.toggle}
    >
      {theme === "dark" ? "☀" : "☾"}
    </button>
  );
}
