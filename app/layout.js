import "./globals.css";
import Link from "next/link";
import localFont from "next/font/local";
import Providers from "@/components/Providers";
import CartBadge from "@/components/CartBadge";
import ThemeToggle from "@/components/ThemeToggle";
import Logo from "@/components/Logo";
import Footer from "@/components/Footer";
import KitchenLink from "./KitchenLink";
import AuthStatus from "./AuthStatus";
import styles from "./layout.module.css";

const inter = localFont({
  src: "./fonts/Inter-Latin.woff2",
  display: "swap",
  weight: "100 900",
  variable: "--font-inter",
});

const siteUrl = process.env.SITE_URL || "https://addis-eats-next-45.vercel.app";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: "%s · Addis Eats",
    default: "Addis Eats — food delivery in Addis Ababa",
  },
  description:
    "Order Ethiopian favourites from Addis Eats, with delivery across Addis Ababa.",
  openGraph: {
    siteName: "Addis Eats",
    locale: "en_ET",
    type: "website",
  },
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Providers>
          <header className={styles.header}>
            <div className={styles.headerInner}>
              <Link href="/" className={styles.brand}>
                <Logo size={34} />
                <span>Addis Eats</span>
              </Link>
              <nav className={styles.nav} aria-label="Main navigation">
                <Link href="/menu">Menu</Link>
                <Link href="/cart" className={styles.cartLink}>
                  Cart <CartBadge />
                </Link>
                <Link href="/checkout">Checkout</Link>
                <Link href="/orders">Orders</Link>
                <KitchenLink />
                <ThemeToggle />
              </nav>
              <div className={styles.authActions}>
                <AuthStatus />
              </div>
            </div>
          </header>
          <main className="container">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}