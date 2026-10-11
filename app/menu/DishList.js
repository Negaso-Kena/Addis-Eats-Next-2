import DishCard from "@/components/DishCard";
import styles from "@/components/DishList.module.css";

export default function DishList({ dishes, prioritizeFirst = false }) {
  if (!dishes?.length) {
    return <p className={styles.empty}>No dishes in this category.</p>;
  }

  return (
    <div className={styles.grid}>
      {dishes.map((dish, index) => (
        <DishCard
          key={dish.id}
          dish={dish}
          priority={prioritizeFirst && index === 0}
        />
      ))}
    </div>
  );
}