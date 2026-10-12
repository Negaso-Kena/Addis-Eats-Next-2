import { redirect } from "next/navigation";
import { getAvailableDishes, getDishesPage } from "@/lib/dishes";
import PagedDishes from "./PagedDishes";

const featuredDish = getAvailableDishes()[0];

export const metadata = {
  title: "Browse all dishes",
  description:
    "Explore Addis Eats dishes page by page, with Ethiopian meals, pizza, burgers and drinks.",
  alternates: { canonical: "/menu/browse" },
  openGraph: {
    title: "Browse all dishes · Addis Eats",
    description:
      "Explore Addis Eats dishes page by page, with Ethiopian meals, pizza, burgers and drinks.",
    url: "/menu/browse",
    images: [
      {
        url: featuredDish?.image || "/opengraph-image",
        alt: featuredDish?.name || "Addis Eats menu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Browse all dishes · Addis Eats",
    description:
      "Explore Addis Eats dishes page by page, with Ethiopian meals, pizza, burgers and drinks.",
    images: [featuredDish?.image || "/opengraph-image"],
  },
};

export default async function BrowsePage({ searchParams }) {
  const params = await searchParams; // Next 16: searchParams is async
  const requested = Number.parseInt(params?.page, 10) || 1;
  const initial = getDishesPage(requested);

  // An out-of-range page (?page=99) goes to the real last page.
  if (initial.page !== requested) {
    redirect(`/menu/browse?page=${initial.page}`);
  }

  return (
    <section>
      <h1>All dishes</h1>
      <PagedDishes initial={initial} />
    </section>
  );
}