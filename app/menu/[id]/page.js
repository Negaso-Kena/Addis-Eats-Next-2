import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getDishById, getDishes } from "@/lib/dishes";
import { formatCurrency } from "@/lib/formatCurrency";
import AddToCartButton from "@/components/AddToCartButton";
import { siteUrl } from "@/lib/siteUrl";
import styles from "./page.module.css";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const dish = getDishById(id);

  if (!dish) {
    return {
      title: "Dish not found",
      description: "This dish is not available in the Addis Eats menu.",
      robots: { index: false, follow: false },
    };
  }

  const description = `${dish.description} Order for ${dish.price} ETB, delivered across Addis Ababa.`;

  return {
    title: dish.name,
    description,
    alternates: { canonical: `/menu/${dish.id}` },
    openGraph: {
      title: `${dish.name} · Addis Eats`,
      description,
      type: "article",
      url: `/menu/${dish.id}`,
      images: [{ url: dish.image, alt: dish.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${dish.name} · Addis Eats`,
      description,
      images: [dish.image],
    },
  };
}

export function generateStaticParams() {
  return getDishes().map((d) => ({ id: String(d.id) }));
}

export const dynamicParams = false;

export default async function DishPage({ params }) {
  const { id } = await params; // Next 16: params is async
  const dish = getDishById(id);

  if (!dish) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MenuItem",
    name: dish.name,
    description: dish.description,
    image: dish.image ? new URL(dish.image, siteUrl).href : undefined,
    offers: {
      "@type": "Offer",
      price: dish.price,
      priceCurrency: "ETB",
      availability: dish.available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: new URL(`/menu/${dish.id}`, siteUrl).href,
    },
  };

  return (
    <article className={styles.article}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Link href="/menu" className={styles.back}>← Menu</Link>
      <div className={styles.layout}>
        {dish.image && (
          <Image
            src={dish.image}
            alt={dish.name}
            width={600}
            height={400}
            sizes="(max-width: 640px) calc(100vw - 2rem), 320px"
            quality={60}
            fetchPriority="high"
            priority
            className={styles.image}
          />
        )}
        <div className={styles.info}>
          <h1>{dish.name}</h1>
          <p className={styles.description}>{dish.description}</p>
          <p className={styles.price}>{formatCurrency(dish.price)}</p>
          <p className={styles.meta}>
            Category: {dish.category}
            {dish.diet ? ` · ${dish.diet}` : ""}
          </p>
          {dish.ingredients?.length > 0 && (
            <p className={styles.ingredients}>
              Ingredients: {dish.ingredients.join(", ")}
            </p>
          )}
          {dish.available === false && (
            <p className={styles.unavailable}>Currently unavailable</p>
          )}
          <div className={styles.action}>
            <AddToCartButton dish={dish} />
          </div>
        </div>
      </div>
    </article>
  );
}