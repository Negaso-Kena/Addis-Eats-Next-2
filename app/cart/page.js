import CartView from "@/components/CartView";

export const metadata = {
  title: "Your order",
  description: "Review the dishes in your Addis Eats order before checkout.",
  alternates: { canonical: "/cart" },
  robots: { index: false, follow: false },
  openGraph: {
    title: "Your order · Addis Eats",
    description: "Review the dishes in your Addis Eats order before checkout.",
    images: ["/images/social-home.jpg"],
  },
};

export default function CartPage() {
  return (
    <section>
      <h1>Your order</h1>
      <CartView />
    </section>
  );
}