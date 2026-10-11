import Link from "next/link";
import { formatCurrency } from "@/lib/formatCurrency";
import AddToCartButton from "./AddToCartButton";
import Image from "next/image";
import styles from "./DishCard.module.css";

export default function DishCard({ dish, priority = false }) {
  return (
    <article className={styles.card}>
      <Link href={`/menu/${dish.id}`} className={styles.link}>
        {dish.image && (
          <Image
            src={dish.image}
            alt={dish.name}
            width={400}
            height={300}
            sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 900px) 50vw, 340px"
            quality={60}
            preload={priority}
            fetchPriority={priority ? "high" : undefined}
            className={styles.image}
          />
        )}
        <div className={styles.body}>
          <h3 className={styles.name}>{dish.name}</h3>
          <p className={styles.description}>{dish.description}</p>
          <p className={styles.price}>{formatCurrency(dish.price)}</p>
        </div>
      </Link>
      <div className={styles.footer}>
        <AddToCartButton dish={dish} />
      </div>
    </article>
  );
}
