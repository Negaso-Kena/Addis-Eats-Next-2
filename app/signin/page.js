import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { signIn } from "@/app/auth-actions";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata = {
  title: "Sign in",
  description: "Sign in to manage Addis Eats orders and delivery details.",
  alternates: { canonical: "/signin" },
  robots: { index: false, follow: false },
  openGraph: {
    title: "Sign in · Addis Eats",
    description: "Sign in to manage Addis Eats orders and delivery details.",
    images: ["/opengraph-image"],
  },
};

export default async function SignInPage({ searchParams }) {
  // If already signed in, no need to show the form
  const user = await getSession();
  if (user) {
    redirect("/");
  }

  const params = await searchParams;
  const error = params?.error === "1";
  const next = typeof params?.next === "string" ? params.next : "/";

  return (
    <section className={styles.panel}>
      <h1>Sign in</h1>
      <p className={styles.demoAccounts}>
        Demo accounts:
        <br />
        Customer → <code>0911223344</code> / <code>customer123</code>
        <br />
        Staff → <code>0999887766</code> / <code>staff123</code>
      </p>

      {error && (
        <p className={styles.error}>
          Invalid phone or password. Try again.
        </p>
      )}

      <form action={signIn} className={styles.form}>
        {/* Carry the intended destination through the form */}
        <input type="hidden" name="next" value={next} />

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

        <button type="submit" className={styles.submit}>
          Sign in
        </button>
      </form>

      <p className={styles.back}>
        <Link href="/">← Back to home</Link>
      </p>
    </section>
  );
}