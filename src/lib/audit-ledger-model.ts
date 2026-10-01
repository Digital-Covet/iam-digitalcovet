import { toEventLabel, toStatusLabel, toTargetAppLabel } from "@/lib/dashboard-metrics";
import type { AuditLedgerEntry, AuditLedgerFilters, AuditTimeRange } from "@/types";

export const LEDGER_PAGE_SIZE = 25;
export const LEDGER_EXPORT_LIMIT = 5000;

const MAX_ACTOR_LENGTH = 100;
const HOUR_MS = 60 * 60 * 1000;

export interface FilterOption {
  value: string;
  label: string;
}

const RANGE_WINDOW_MS: Record<Exclude<AuditTimeRange, "all">, number> = {
  "1h": HOUR_MS,
  "24h": 24 * HOUR_MS,
  "7d": 7 * 24 * HOUR_MS,
  "30d": 30 * 24 * HOUR_MS,
};

const EVENT_KEYS = [
  "failed_login",
  "session_initiated",
  "token_renewed",
  "granted_role",
  "policy_violation",
  "file_deleted",
] as const;
const TARGET_APP_KEYS = ["iam_system", "share", "portfolio", "desk"] as const;
const STATUS_KEYS = ["success", "failed", "warning"] as const;

const withAllOption = (allLabel: string, keys: readonly string[], toLabel: (key: string) => string): FilterOption[] => [
  { value: "", label: allLabel },
  ...keys.map((key) => ({ value: key, label: toLabel(key) })),
];

export const RANGE_OPTIONS: FilterOption[] = [
  { value: "1h", label: "Last hour" },
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "all", label: "All time" },
];
export const EVENT_OPTIONS = withAllOption("All Events", EVENT_KEYS, toEventLabel);
export const TARGET_APP_OPTIONS = withAllOption("All Targets", TARGET_APP_KEYS, toTargetAppLabel);
export const STATUS_OPTIONS = withAllOption("All Outcomes", STATUS_KEYS, toStatusLabel);

export const EMPTY_LEDGER_FILTERS: AuditLedgerFilters = {
  range: "24h",
  actor: "",
  event: "",
  targetApp: "",
  status: "",
  page: 1,
};

const oneOf = <T extends string>(allowed: readonly T[], value: string): T | "" =>
  allowed.find((candidate) => candidate === value) ?? "";

/** Filters arrive from the client, so every field is narrowed to a known value before it reaches a query. */
export function sanitizeLedgerFilters(raw: AuditLedgerFilters): AuditLedgerFilters {
  const page = Number.isInteger(raw.page) && raw.page > 0 ? raw.page : 1;

  return {
    range: oneOf(["1h", "24h", "7d", "30d", "all"], raw.range) || EMPTY_LEDGER_FILTERS.range,
    actor: String(raw.actor ?? "").trim().slice(0, MAX_ACTOR_LENGTH),
    event: oneOf(EVENT_KEYS, raw.event),
    targetApp: oneOf(TARGET_APP_KEYS, raw.targetApp),
    status: oneOf(STATUS_KEYS, raw.status),
    page,
  };
}

export function rangeStart(range: AuditTimeRange, now: Date): Date | null {
  return range === "all" ? null : new Date(now.getTime() - RANGE_WINDOW_MS[range]);
}

export function hasActiveLedgerFilters(filters: AuditLedgerFilters): boolean {
  return (
    filters.range !== EMPTY_LEDGER_FILTERS.range ||
    filters.actor !== "" ||
    filters.event !== "" ||
    filters.targetApp !== "" ||
    filters.status !== ""
  );
}

export function toInspectorPayload(entry: AuditLedgerEntry) {
  return {
    id: entry.id,
    timestamp: entry.timestamp,
    event: entry.eventKey,
    outcome: entry.statusKey,
    targetApp: entry.targetAppKey,
    actor: { id: entry.actorUserId, name: entry.actorName, email: entry.actorEmail },
    network: { ipAddress: entry.ipAddress, location: entry.location },
  };
}

export const toInspectorJson = (entry: AuditLedgerEntry) => JSON.stringify(toInspectorPayload(entry), null, 2);

export const toLedgerJsonl = (entries: AuditLedgerEntry[]) =>
  entries.map((entry) => JSON.stringify(toInspectorPayload(entry))).join("\n");

export const toShortEventId = (id: string) => `evt_${id.slice(-8)}`;
