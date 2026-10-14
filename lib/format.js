// One place for display formatting. Built once at module level: creating an
// Intl formatter is expensive, calling one is cheap. Day 47 extends this file.
// Locale and time zone are always named, so the server and a phone agree.
export const etb = new Intl.NumberFormat("en-ET", {
  style: "currency",
  currency: "ETB",
  maximumFractionDigits: 0,
});

export const TIME_ZONE = "Africa/Addis_Ababa"; // EAT, UTC+3, no daylight saving

const dayKeyFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const dayLabelFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "short",
});

const whenFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  dateStyle: "medium",
  timeStyle: "short",
});

// "2026-10-14" — the calendar day in Addis Ababa, for grouping.
export const dayKey = (date) => dayKeyFormat.format(date);
// "14 Oct"
export const dayLabel = (date) => dayLabelFormat.format(date);
// "14 Oct 2026, 18:40"
export const when = (iso) => whenFormat.format(new Date(iso));

const relativeFormat = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
// "12 minutes ago", "yesterday"
export function relative(iso, now = Date.now()) {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 60) return relativeFormat.format(seconds, "second");
  if (abs < 3600) return relativeFormat.format(Math.round(seconds / 60), "minute");
  if (abs < 86400) return relativeFormat.format(Math.round(seconds / 3600), "hour");
  return relativeFormat.format(Math.round(seconds / 86400), "day");
}
