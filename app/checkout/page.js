import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getOrderForUser } from "@/lib/orders-store";
import { formatCurrency } from "@/lib/formatCurrency";
import CheckoutForm from "@/components/CheckoutForm";
import ClearCartOnConfirm from "@/components/ClearCartOnConfirm";
import Link from "next/link";

export const metadata = {
  title: "Checkout",
  description: "Complete your Addis Eats order and arrange delivery in Addis Ababa.",
  alternates: { canonical: "/checkout" },
  robots: { index: false, follow: false },
  openGraph: {
    title: "Checkout · Addis Eats",
    description: "Complete your Addis Eats order and arrange delivery in Addis Ababa.",
    images: ["/images/social-home.jpg"],
  },
};

function getQueryString(params) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params ?? {})) {
    if (Array.isArray(value)) {
      value.forEach((entry) => query.append(key, entry));
    } else if (typeof value === "string") {
      query.set(key, value);
    }
  }
  return query.toString();
}

export default async function CheckoutPage({ searchParams }) {
  const params = await searchParams;
  // Second layer: verify the real session, not just the cookie existence
  const user = await getSession();
  if (!user) {
    const query = getQueryString(params);
    const next = `/checkout${query ? `?${query}` : ""}`;
    redirect(`/signin?${new URLSearchParams({ next })}`);
  }

  const orderId = params?.order;
  const order = orderId
    ? getOrderForUser(orderId, user.id, user.role === "staff")
    : null;

  if (order) {
    return (
      <section>
        {/* The order is placed: empty the cart so the same items are not sent twice. */}
        <ClearCartOnConfirm />
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
      <CheckoutForm error={error} requestId={randomUUID()} />
    </section>
  );
}