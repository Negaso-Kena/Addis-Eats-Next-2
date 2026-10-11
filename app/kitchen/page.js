import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getAllOrders } from "@/lib/orders-store";
import { formatCurrency } from "@/lib/formatCurrency";
import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";
import styles from "./page.module.css";

export const metadata = {
  title: "Kitchen orders",
  description: "Staff order-management workspace for Addis Eats.",
  alternates: { canonical: "/kitchen" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function KitchenPage() {
  const user = await getSession();

  // Must be signed in
  if (!user) {
    redirect("/signin?next=/kitchen");
  }

  // Must be staff — this is the real server-side check
  if (user.role !== "staff") {
    return (
      <section className={styles.denied}>
        <h1>Staff access required</h1>
        <p>Your account does not have permission to view kitchen orders.</p>
        <SignOutButton />
        <Link href="/">Return to Addis Eats</Link>
      </section>
    );
  }

  const orders = getAllOrders();

  return (
    <section>
      <h1>Kitchen</h1>
      <p className={styles.intro}>
        Signed in as {user.name} (staff) — all orders visible
      </p>
      <SignOutButton />

      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <ul className={styles.list}>
          {orders.map((order) => (
            <li className={styles.card} key={order.id}>
              <div className={styles.heading}>
                <strong>
                  <Link href={`/orders/${order.id}`}>{order.id}</Link>
                </strong>
                <span>{order.status}</span>
              </div>
              <div className={styles.customer}>
                {order.customer.name} · {order.customer.phone} · {order.customer.area}
              </div>
              <div className={styles.items}>
                {order.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
              </div>
              <div className={styles.total}>
                {formatCurrency(order.total)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}