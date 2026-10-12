import { getAvailableDishes, CATEGORIES } from "@/lib/dishes";
import { getSocialImage } from "@/lib/socialImage";
import SearchBox from "./SearchBox";
import Link from "next/link";
import styles from "./page.module.css";
export const revalidate = 3600;

const featuredDish = getAvailableDishes()[0];

export const metadata = {
  title: "Menu",
  description:
    "Browse Doro Wat, Tibs, Kitfo, Shiro and more Ethiopian dishes, delivered across Addis Ababa.",
  alternates: { canonical: "/menu" },
  openGraph: {
    title: "Ethiopian food menu · Addis Eats",
    description:
      "Browse Doro Wat, Tibs, Kitfo, Shiro and more Ethiopian dishes, delivered across Addis Ababa.",
    url: "/menu",
    images: [
      {
        url: getSocialImage(featuredDish?.image),
        alt: featuredDish?.name || "Addis Eats menu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ethiopian food menu · Addis Eats",
    description:
      "Browse Doro Wat, Tibs, Kitfo, Shiro and more Ethiopian dishes, delivered across Addis Ababa.",
    images: [getSocialImage(featuredDish?.image)],
  },
};

export default function MenuPage() {
  const dishes = getAvailableDishes();

  return (
    <section>
      <h1>Menu</h1>
      <SearchBox
        categories={CATEGORIES}
        dishes={dishes}
        lcpDishId={dishes[0]?.id}
      />
      <p className={styles.browseLink}>
        <Link href="/menu/browse">Browse all dishes, page by page →</Link>
      </p>
    </section>
  );
}