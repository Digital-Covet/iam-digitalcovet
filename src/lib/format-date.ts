const DATE_FORMAT = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" });
const DATE_TIME_FORMAT = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** ISO-style `2026-03-12`, matching the audit ledger's timestamp convention. */
export function formatDate(iso: string): string {
  return DATE_FORMAT.format(new Date(iso));
}

/** `2026-03-30 17:42:01` in UTC, derived from the ISO string so server and client always agree. */
export const formatUtcTimestamp = (iso: string): string => iso.slice(0, 19).replace("T", " ");

export function formatDateTime(iso: string): string {
  return DATE_TIME_FORMAT.format(new Date(iso)).replace(",", "");
}
