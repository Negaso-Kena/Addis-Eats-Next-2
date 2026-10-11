import { getDishes } from "@/lib/dishes";

const siteUrl = "https://addiseats.et";

export default function sitemap() {
  const routes = [
    { path: "", priority: 1 },
    { path: "/menu", priority: 0.9 },
    { path: "/menu/browse", priority: 0.8 },
    ...getDishes().map((dish) => ({
      path: `/menu/${dish.id}`,
      priority: 0.7,
    })),
  ];

  return routes.map(({ path, priority }) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: path.startsWith("/menu/") ? "weekly" : "daily",
    priority,
  }));
}
