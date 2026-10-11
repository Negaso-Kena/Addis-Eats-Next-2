import DishCard from "./DishCard";
import styles from "./DishList.module.css";

export default function DishList({
  dishes,
  prioritizeFirst = false,
  prioritizedDishId,
}) {
  if (!dishes || dishes.length === 0) {
    return <p className={styles.empty}>No dishes found.</p>;
  }
  return (
    <div className={styles.grid}>
      {dishes.map((dish, index) => (
        <DishCard
          key={dish.id}
          dish={dish}
          priority={
            (prioritizeFirst && index === 0) ||
            dish.id === prioritizedDishId
          }
        />
      ))}
    </div>
  );
}
