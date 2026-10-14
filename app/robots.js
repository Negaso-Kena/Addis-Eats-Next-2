import { siteUrl } from "@/lib/siteUrl";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      disallow: [
        "/api/",
        "/cart",
        "/checkout",
        "/dashboard",
        "/kitchen",
        "/orders",
        "/signin",
      ],
    },
    sitemap: new URL("/sitemap.xml", siteUrl).href,
  };
}
