import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getOrderForUser } from "@/lib/orders-store";
import OrderStatus from "./OrderStatus";
import styles from "./page.module.css";

export const metadata = {
  title: "Order tracking",
  description: "Check the delivery status of an Addis Eats order.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function OrderPage({ params }) {
  const user = await getSession();
  if (!user) {
    const { id } = await params;
    redirect(`/signin?next=/orders/${id}`);
  }

  const { id } = await params;
  const order = getOrderForUser(id, user.id, user.role === "staff");
  if (!order) notFound();

  return (
    <section className={styles.orderPage}>
      <h1>Order {order.id}</h1>
      <p className={styles.muted}>
        Signed in as {user.name}
        {user.role === "staff" && " (staff)"}
      </p>
      <OrderStatus id={order.id} initial={order} />
    </section>
  );
}