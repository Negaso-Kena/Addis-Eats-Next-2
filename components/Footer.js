import Link from "next/link";
import Logo from "./Logo";
import styles from "./Footer.module.css";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brandCol}>
          <div className={styles.brandRow}>
            <Logo size={28} />
            <span>Addis Eats</span>
          </div>
          <p className={styles.tagline}>
            Authentic Ethiopian flavours, delivered warm across Addis Ababa.
          </p>
        </div>

        <div className={styles.col}>
          <h3>Quick links</h3>
          <Link href="/">Home</Link>
          <Link href="/menu">Menu</Link>
          <Link href="/cart">Cart</Link>
          <Link href="/checkout">Checkout</Link>
        </div>

        <div className={styles.col}>
          <h3>Get in touch</h3>
          <span>Megenagna, Addis Ababa</span>
          <span>+251 91 234 5678</span>
          <span>hello@addiseats.example</span>
        </div>
      </div>

      <div className={styles.bottom}>
        <span>© {year} Addis Eats — built in Next.js.</span>
      </div>
    </footer>
  );
}