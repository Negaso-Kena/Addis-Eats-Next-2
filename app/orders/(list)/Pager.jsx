import Link from "next/link";
import styles from "./page.module.css";

// Each page is a real link to a real URL: back button, middle-click and
// sharing all work, and the sort order is carried across pages.
export default function Pager({ page, pages, sort, dir }) {
  if (pages <= 1) return null;
  const href = (n) => `/orders?sort=${sort}&dir=${dir}&page=${n}`;
  return (
    <nav className={styles.pager} aria-label="Order pages">
      {page > 1 ? <Link href={href(page - 1)} rel="prev">← Previous</Link> : <span aria-hidden="true" />}
      <ul>
        {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
          <li key={n}>
            {n === page ? (
              <span aria-current="page" className={styles.current}>{n}</span>
            ) : (
              <Link href={href(n)}>{n}</Link>
            )}
          </li>
        ))}
      </ul>
      {page < pages ? <Link href={href(page + 1)} rel="next">Next →</Link> : <span aria-hidden="true" />}
    </nav>
  );
}
