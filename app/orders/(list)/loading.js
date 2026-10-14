import styles from "./page.module.css";

// A skeleton the shape of the table: a header row and rows of the same height,
// so nothing jumps when the data lands.
export default function OrdersLoading() {
  return (
    <section aria-busy="true">
      <h1>Orders</h1>
      <div className={styles.skeletonRows}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={styles.skeletonRow} />
        ))}
      </div>
    </section>
  );
}
