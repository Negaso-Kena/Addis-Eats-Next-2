"use client";

import Link from "next/link";
import { useSession, clearSessionLocally } from "./useSession";
import { signOut } from "@/app/auth-actions";
import styles from "./layout.module.css";

export default function AuthStatus() {
  const user = useSession();

  if (user === undefined) return null;

  if (!user) {
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
      <form action={signOut} onSubmit={clearSessionLocally}>
        <button
          type="submit"
          className={styles.signOutButton}
        >
          Sign out
        </button>
      </form>
    </>
  );
}