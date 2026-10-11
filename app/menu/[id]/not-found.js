import Link from "next/link";

export default function DishNotFound() {
  return (
    <section>
      <h1>Dish not found</h1>
      <p>That dish is not on the menu.</p>
      <p>
        <Link href="/menu">Back to menu</Link>
      </p>
    </section>
  );
}