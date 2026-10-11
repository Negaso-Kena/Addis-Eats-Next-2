import Link from "next/link";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/formatCurrency";
import { getAllOrders, getOrdersByUserId } from "@/lib/orders-store";
import { getSession } from "@/lib/session";
import SignOutButton from "@/components/SignOutButton";
import styles from "./page.module.css";

export const metadata = {
  title: "Your orders",
  description: "View and track orders placed with Addis Eats.",
  alternates: { canonical: "/orders" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const user = await getSession();
  if (!user) redirect("/signin?next=/orders");

  const orders =
    user.role === "staff" ? getAllOrders() : getOrdersByUserId(user.id);

  return (
    <section>
      <h1>{user.role === "staff" ? "All orders" : "Your orders"}</h1>
      <SignOutButton />
      {orders.length === 0 ? (
        <p className={styles.empty}>No orders yet.</p>
      ) : (
        <ul className={styles.list}>
          {orders.map((order) => (
            <li className={styles.card} key={order.id}>
              <div className={styles.heading}>
                <Link href={`/orders/${order.id}`}>{order.id}</Link>
                <span>{order.status}</span>
              </div>
              <p>
                {order.items.map((item) => `${item.quantity}× ${item.name}`).join(", ")}
              </p>
              <strong>{formatCurrency(order.total)}</strong>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
