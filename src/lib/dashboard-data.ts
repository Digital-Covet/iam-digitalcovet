"use server";

import { getRequestEvent } from "solid-js/web";
import { prisma } from "@/db";
import {
  ALL_APPS,
  CLIENT_APPS,
  CLIENT_ID_BY_APP,
  ELEVATED_ROLES,
} from "@/lib/app-access";
import { auth } from "@/lib/auth";
import { resolveAvatarUrl } from "@/lib/avatar";
import {
  buildAppHealth,
  buildMetrics,
  buildSessionShares,
  toEventLabel,
  toStatusLabel,
  toTargetAppLabel,
} from "@/lib/dashboard-metrics";
import type {
  AppAccess,
  AppHealth,
  AuditLogEntry,
  DashboardData,
  SecurityPosture,
  SessionShare,
} from "@/types";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;
const RECENT_EVENT_LIMIT = 8;

const NOT_BANNED = [{ banned: false }, { banned: null }];

export async function isAdminRequest(): Promise<boolean> {
  const event = getRequestEvent();
  if (!event) return false;
  const session = await auth.api.getSession({ headers: event.request.headers });
  const role = (session?.user as { role?: string } | undefined)?.role;
  return role !== undefined && ELEVATED_ROLES.has(role);
}

async function loadMetrics(now: Date) {
  const dayAgo = new Date(now.getTime() - DAY_MS);
  const weekAgo = new Date(now.getTime() - WEEK_MS);

  const [
    totalUsers,
    activeUsers,
    newUsersThisWeek,
    mfaEnrolledUsers,
    activeSessions,
    authFailures24h,
    lockedAccounts,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { OR: NOT_BANNED } }),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.user.count({ where: { twoFactorEnabled: true } }),
    prisma.session.count({ where: { expiresAt: { gt: now } } }),
    prisma.auditLog.count({
      where: { status: "failed", timestamp: { gte: dayAgo } },
    }),
    prisma.twoFactor.count({ where: { lockedUntil: { gt: now } } }),
  ]);

  return buildMetrics({
    totalUsers,
    activeUsers,
    newUsersThisWeek,
    mfaEnrolledUsers,
    activeSessions,
    authFailures24h,
    lockedAccounts,
  });
}

export async function loadAppHealth(now: Date): Promise<AppHealth[]> {
  const dayAgo = new Date(now.getTime() - DAY_MS);

  const [clients, exchanges, ...authorizedUserCounts] = await Promise.all([
    prisma.oauthClient.findMany({
      where: { clientId: { in: Object.keys(CLIENT_APPS) } },
      select: { clientId: true, disabled: true },
    }),
    prisma.oauthAccessToken.groupBy({
      by: ["clientId"],
      where: { createdAt: { gte: dayAgo } },
      _count: { _all: true },
    }),
    ...ALL_APPS.map((app) =>
      prisma.user.count({
        where: {
          OR: [
            { role: { in: [...ELEVATED_ROLES] as ("admin" | "superadmin")[] } },
            { appAccess: { has: app } },
          ],
        },
      }),
    ),
  ]);

  return ALL_APPS.map((app, index) =>
    buildAppHealth({
      app,
      client: clients.find(
        (client) => client.clientId === CLIENT_ID_BY_APP[app],
      ),
      authorizedUsers: authorizedUserCounts[index],
      tokenExchanges24h:
        exchanges.find((row) => row.clientId === CLIENT_ID_BY_APP[app])?._count
          ._all ?? 0,
    }),
  );
}

async function loadSessionShares(now: Date): Promise<SessionShare[]> {
  const liveTokens = await prisma.oauthAccessToken.groupBy({
    by: ["clientId"],
    where: { revoked: null, expiresAt: { gt: now } },
    _count: { _all: true },
  });

  const sessionsByApp = Object.fromEntries(
    ALL_APPS.map((app) => [
      app,
      liveTokens.find((row) => row.clientId === CLIENT_ID_BY_APP[app])?._count
        ._all ?? 0,
    ]),
  ) as Record<AppAccess, number>;

  return buildSessionShares(sessionsByApp);
}

async function loadPosture(now: Date): Promise<SecurityPosture> {
  const [pendingInvitations, unenrolledUsers, bannedUsers] = await Promise.all([
    prisma.invitation.count({
      where: { status: "pending", expiresAt: { gt: now } },
    }),
    prisma.user.count({
      where: { OR: [{ twoFactorEnabled: false }, { twoFactorEnabled: null }] },
    }),
    prisma.user.count({ where: { banned: true } }),
  ]);
  return { pendingInvitations, unenrolledUsers, bannedUsers };
}

async function loadRecentEvents(): Promise<AuditLogEntry[]> {
  const logs = await prisma.auditLog.findMany({
    orderBy: { timestamp: "desc" },
    take: RECENT_EVENT_LIMIT,
  });

  return logs.map((log) => ({
    id: log.id,
    timestamp: log.timestamp.toISOString(),
    actorName: log.actorName,
    actorEmail: log.actorEmail,
    actorAvatarUrl: resolveAvatarUrl(log.actorAvatarUrl),
    actorInitials: log.actorInitials,
    event: toEventLabel(log.event),
    targetApp: toTargetAppLabel(log.targetApp),
    ipAddress: log.ipAddress ?? "N/A",
    location: log.location ?? "Unknown",
    status: toStatusLabel(log.status),
  }));
}

/** Resolves to `null` when the caller is not an admin, so nothing leaks to employees. */
export async function loadDashboardData(): Promise<DashboardData | null> {
  if (!(await isAdminRequest())) return null;

  const now = new Date();
  const [metrics, apps, sessionShares, posture, recentEvents] =
    await Promise.all([
      loadMetrics(now),
      loadAppHealth(now),
      loadSessionShares(now),
      loadPosture(now),
      loadRecentEvents(),
    ]);

  return { metrics, apps, sessionShares, posture, recentEvents };
}
