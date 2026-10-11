"use client";

import Link from "next/link";
import { useSession } from "./useSession";
import styles from "./layout.module.css";

export default function KitchenLink() {
  const user = useSession();
  if (user?.role !== "staff") return null;

  return <Link href="/kitchen" className={styles.kitchenLink}>Kitchen</Link>;
}