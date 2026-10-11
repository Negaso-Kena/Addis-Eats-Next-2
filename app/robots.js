const siteUrl = "https://addiseats.et";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      disallow: [
        "/api/",
        "/cart",
        "/checkout",
        "/kitchen",
        "/orders",
        "/signin",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
