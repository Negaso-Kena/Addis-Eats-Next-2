export const publicDishCacheHeaders = {
  "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
};

export const privateNoStoreHeaders = {
  "Cache-Control": "private, no-store, max-age=0, must-revalidate",
};
