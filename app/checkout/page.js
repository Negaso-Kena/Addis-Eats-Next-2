import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getOrderForUser } from "@/lib/orders-store";
import { formatCurrency } from "@/lib/formatCurrency";
import CheckoutForm from "@/components/CheckoutForm";
import Link from "next/link";

export const metadata = {
  title: "Checkout",
  description: "Complete your Addis Eats order and arrange delivery in Addis Ababa.",
  alternates: { canonical: "/checkout" },
  robots: { index: false, follow: false },
  openGraph: {
    title: "Checkout · Addis Eats",
    description: "Complete your Addis Eats order and arrange delivery in Addis Ababa.",
    images: ["/opengraph-image"],
  },
};

export default async function CheckoutPage({ searchParams }) {
  // Second layer: verify the real session, not just the cookie existence
  const user = await getSession();
  if (!user) {
    redirect("/signin?next=/checkout");
  }

  const params = await searchParams;
  const orderId = params?.order;
  const order = orderId
    ? getOrderForUser(orderId, user.id, user.role === "staff")
    : null;

  if (order) {
    return (
      <section>
        <h1>Order confirmed!</h1>
        <p>
          Order {order.id} has been received. Estimated arrival in {order.etaLabel}.
        </p>
        <p>
          <strong>Total: {formatCurrency(order.total)}</strong>
        </p>
        <p>
          <Link href={`/orders/${order.id}`}>Track your order →</Link>
        </p>
      </section>
    );
  }

  const error = params?.error === "1" ? { field: params.field, message: params.message } : null;

  return (
    <section>
      <h1>Checkout</h1>
      <p className="muted">
        Signed in as {user.name}
      </p>
      <CheckoutForm error={error} />
    </section>
  );
}