import Link from "next/link";
import { getSpecials } from "@/lib/dishes";
import { siteUrl } from "@/lib/siteUrl";
import DishList from "./menu/DishList";
import styles from "./page.module.css";

export const metadata = {
  description:
    "Discover Ethiopian favourites and daily specials, freshly prepared and delivered across Addis Ababa.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Ethiopian food delivery in Addis Ababa · Addis Eats",
    description:
      "Discover Ethiopian favourites and daily specials, freshly prepared and delivered across Addis Ababa.",
    url: "/",
    images: [
      {
        url: "/images/landing-preview-v2.jpg",
        width: 1200,
        height: 630,
        alt: "Ethiopian food platter from Addis Eats",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ethiopian food delivery in Addis Ababa · Addis Eats",
    description:
      "Discover Ethiopian favourites and daily specials, freshly prepared and delivered across Addis Ababa.",
    images: ["/images/landing-preview-v2.jpg"],
  },
};

export default function HomePage() {
  const specials = getSpecials();

  // Only facts the page and data already state — nothing invented.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: "Addis Eats",
    url: siteUrl.href,
    servesCuisine: "Ethiopian",
    hasMenu: new URL("/menu", siteUrl).href,
  };

  return (
    <section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <div className={styles.hero}>
        <h1>Addis Eats</h1>
        <p>Authentic Ethiopian flavours, delivered warm across Addis Ababa.</p>
        <Link href="/menu" className={styles.menuLink}>
          View full menu →
        </Link>
      </div>
      <h2 className={styles.sectionHeading}>Today&apos;s specials</h2>
      <DishList dishes={specials} prioritizeFirst />
    </section>
  );
}