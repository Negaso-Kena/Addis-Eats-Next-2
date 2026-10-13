"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/app/auth-actions";
import { setSessionUser } from "@/app/useSession";
import styles from "./page.module.css";

export default function SignInForm({ next }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsPending(true);

    try {
      const result = await signIn(new FormData(event.currentTarget));
      if (result.user) {
        setSessionUser(result.user);
      } else {
        setIsPending(false);
      }
      router.replace(result.redirectTo);
      router.refresh();
    } catch (submitError) {
      console.error("Sign-in request failed.", submitError);
      setError("Unable to sign in right now. Please try again.");
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <input type="hidden" name="next" value={next} />

      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}

      <label htmlFor="phone">
        Phone
        <input
          id="phone"
          type="tel"
          name="phone"
          required
          placeholder="0911223344"
        />
      </label>

      <label htmlFor="password">
        Password
        <input
          id="password"
          type="password"
          name="password"
          required
        />
      </label>

      <button type="submit" className={styles.submit} disabled={isPending}>
        {isPending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
