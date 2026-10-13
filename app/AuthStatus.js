"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, clearSessionLocally } from "./useSession";
import { signOut } from "@/app/auth-actions";
import styles from "./layout.module.css";

export default function AuthStatus() {
  const user = useSession();
  const pathname = usePathname();
  const hideAuthButtons =
    pathname === "/checkout" ||
    pathname.startsWith("/checkout/") ||
    pathname === "/orders" ||
    pathname.startsWith("/orders/");

  if (user === undefined) return null;

  if (!user) {
    if (hideAuthButtons) return null;
    return (
      <Link href="/signin" className={styles.authLink}>
        Sign in
      </Link>
    );
  }

  return (
    <>
      <span className={styles.authName}>
        {user.name}
        {user.role === "staff" && " (staff)"}
      </span>
      {!hideAuthButtons && (
        <form action={signOut} onSubmit={clearSessionLocally}>
          <button type="submit" className={styles.signOutButton}>
            Sign out
          </button>
        </form>
      )}
    </>
  );
}