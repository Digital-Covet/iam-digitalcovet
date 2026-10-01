import { query } from "@solidjs/router";
import { prisma } from "@/db";
import { resolveAvatarUrl } from "@/lib/avatar";
import { isAdminRequest } from "@/lib/dashboard-data";
import { toEventLabel, toStatusLabel, toTargetAppLabel } from "@/lib/dashboard-metrics";
import {
  LEDGER_EXPORT_LIMIT,
  LEDGER_PAGE_SIZE,
  rangeStart,
  sanitizeLedgerFilters,
  toLedgerJsonl,
} from "@/lib/audit-ledger-model";
import type { AuditLedgerEntry, AuditLedgerFilters, AuditLedgerPage } from "@/types";
import type { AuditLogEvent, AuditLogStatus, AuditLogTargetApp, Prisma } from "@generated/prisma/client";

function buildWhere(filters: AuditLedgerFilters, now: Date): Prisma.AuditLogWhereInput {
  const since = rangeStart(filters.range, now);

  return {
    ...(since && { timestamp: { gte: since } }),
    ...(filters.event && { event: filters.event as AuditLogEvent }),
    ...(filters.targetApp && { targetApp: filters.targetApp as AuditLogTargetApp }),
    ...(filters.status && { status: filters.status as AuditLogStatus }),
    ...(filters.actor && {
      OR: [
        { actorEmail: { contains: filters.actor, mode: "insensitive" } },
        { actorName: { contains: filters.actor, mode: "insensitive" } },
        { actorUserId: filters.actor },
      ],
    }),
  };
}

function toLedgerEntry(log: Prisma.AuditLogModel): AuditLedgerEntry {
  return {
    id: log.id,
    timestamp: log.timestamp.toISOString(),
    actorUserId: log.actorUserId,
    actorName: log.actorName,
    actorEmail: log.actorEmail,
    actorAvatarUrl: resolveAvatarUrl(log.actorAvatarUrl),
    actorInitials: log.actorInitials,
    event: toEventLabel(log.event),
    eventKey: log.event,
    targetApp: toTargetAppLabel(log.targetApp),
    targetAppKey: log.targetApp,
    ipAddress: log.ipAddress ?? "N/A",
    location: log.location ?? "Unknown",
    status: toStatusLabel(log.status),
    statusKey: log.status,
  };
}

/** Resolves to `null` when the caller is not an admin, so nothing leaks to employees. */
export const getAuditLedger = query(async (raw: AuditLedgerFilters): Promise<AuditLedgerPage | null> => {
  "use server";
  if (!(await isAdminRequest())) return null;

  const filters = sanitizeLedgerFilters(raw);
  const where = buildWhere(filters, new Date());

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: "desc" },
      skip: (filters.page - 1) * LEDGER_PAGE_SIZE,
      take: LEDGER_PAGE_SIZE,
    }),
  ]);

  return { entries: logs.map(toLedgerEntry), total, page: filters.page, pageSize: LEDGER_PAGE_SIZE };
}, "auditLedger");

/** Serialises every event matching the filters (capped) as JSON Lines. */
export async function exportAuditLedger(raw: AuditLedgerFilters): Promise<string> {
  "use server";
  if (!(await isAdminRequest())) throw new Error("You need an administrator role to export audit logs.");

  const filters = sanitizeLedgerFilters(raw);
  const logs = await prisma.auditLog.findMany({
    where: buildWhere(filters, new Date()),
    orderBy: { timestamp: "desc" },
    take: LEDGER_EXPORT_LIMIT,
  });

  return toLedgerJsonl(logs.map(toLedgerEntry));
}
