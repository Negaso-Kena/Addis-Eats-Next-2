import styles from "./page.module.css";

// A skeleton shaped like the page: three figures, then a chart-sized block.
export default function DashboardLoading() {
  return (
    <section className={styles.dashboard} aria-busy="true">
      <h1>Dashboard</h1>
      <p className={styles.intro}>Loading the latest orders…</p>
      <div className={styles.kpis}>
        {[0, 1, 2].map((i) => (
          <div key={i} className={styles.skeleton} style={{ height: 76 }} />
        ))}
      </div>
      <div className={styles.skeleton} style={{ height: 288 }} />
      <div className={styles.skeleton} style={{ height: 288 }} />
    </section>
  );
}
