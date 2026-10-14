import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getAllOrders } from "@/lib/orders-store";
import { summarise, RANGE_DAYS } from "@/lib/dashboard-data";
import { etb } from "@/lib/format";
import SignOutButton from "@/components/SignOutButton";
import RevenueChart from "./RevenueChart";
import OrdersChart from "./OrdersChart";
import styles from "./page.module.css";

export const metadata = {
  title: "Dashboard",
  description: "Staff sales dashboard for Addis Eats.",
  alternates: { canonical: "/dashboard" },
  robots: { index: false, follow: false },
};

// Reads the session cookie, so it is dynamic — and that is correct.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) redirect("/signin?next=/dashboard");

  // The real check, on the server: the interface hiding a link is not security.
  if (user.role !== "staff") {
    return (
      <section>
        <h1>Staff access required</h1>
        <p>Your account does not have permission to view the dashboard.</p>
        <SignOutButton />
        <Link href="/">Return to Addis Eats</Link>
      </section>
    );
  }

  // Aggregate here; three to fourteen rows cross to the browser, not every order.
  const data = summarise(getAllOrders());

  return (
    <section className={styles.dashboard}>
      <h1>Dashboard</h1>
      <p className={styles.intro}>Signed in as {user.name} (staff)</p>

      {data.hasDemo && (
        <p className={styles.demo} role="note">
          Demo data: some orders below are seeded sample orders, not real customers.
        </p>
      )}

      {data.totalOrders === 0 ? (
        // Empty is not an error: say why, and what to do next.
        <div className={styles.emptyState}>
          <h2>No orders to chart yet</h2>
          <p>Charts appear once an order has been placed.</p>
          <Link href="/menu">Browse the menu to place the first one</Link>
        </div>
      ) : (
        <>
          <ul className={styles.kpis}>
            <li>
              <span className={styles.kpiLabel}>Orders</span>
              <strong>{data.totalOrders}</strong>
            </li>
            <li>
              <span className={styles.kpiLabel}>Revenue</span>
              <strong>{etb.format(data.totalRevenue)}</strong>
            </li>
            <li>
              <span className={styles.kpiLabel}>Cancelled</span>
              <strong>{data.cancelled}</strong>
            </li>
          </ul>

          <section aria-labelledby="revenue-heading" className={styles.panel}>
            <h2 id="revenue-heading">Revenue by neighbourhood (ETB, all time)</h2>
            <p className={styles.note}>Which area orders most? Cancelled orders are excluded.</p>
            <RevenueChart data={data.revenueByArea} />
            {/* Screen readers cannot read an SVG; the same numbers as a table. */}
            <table className={styles.table}>
              <caption>Revenue by neighbourhood, same data as the chart</caption>
              <thead>
                <tr>
                  <th scope="col">Neighbourhood</th>
                  <th scope="col" className={styles.num}>Orders</th>
                  <th scope="col" className={styles.num}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.revenueByArea.map((row) => (
                  <tr key={row.area}>
                    <th scope="row">{row.area}</th>
                    <td className={styles.num}>{row.orders}</td>
                    <td className={styles.num}>{etb.format(row.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section aria-labelledby="daily-heading" className={styles.panel}>
            <h2 id="daily-heading">Orders per day (orders, last {RANGE_DAYS} days)</h2>
            <p className={styles.note}>Are orders growing? Days are Addis Ababa time (EAT).</p>
            <OrdersChart data={data.ordersPerDay} />
            <table className={styles.table}>
              <caption>Orders per day, same data as the chart</caption>
              <thead>
                <tr>
                  <th scope="col">Day</th>
                  <th scope="col" className={styles.num}>Orders</th>
                </tr>
              </thead>
              <tbody>
                {data.ordersPerDay.map((row) => (
                  <tr key={row.day}>
                    <th scope="row">{row.day}</th>
                    <td className={styles.num}>{row.orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <p>
            <Link href="/orders">See every order in the table →</Link>
          </p>
        </>
      )}
    </section>
  );
}
