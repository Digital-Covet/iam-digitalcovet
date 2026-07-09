import type { Component } from "solid-js";
import { For } from "solid-js";
import { query, createAsync, type RouteDefinition } from "@solidjs/router";
import {
  Activity,
  ArrowRight,
  ClipboardList,
  FingerprintPatternIcon,
  Shield,
  Users,
} from "lucide-solid";
import { A } from "@solidjs/router";
import AppLayout from "@/components/AppLayout";
import AuthGuard from "@/components/auth/auth-guard";
import StatCard from "@/components/user-directory/StatCard";
import type { StatCardData, AuditLogEntry, ActiveSession } from "@/types";
import { prisma } from "@/db";
import { lookupIp } from "@/lib/ip-geolocation";
import { resolveAvatarUrl } from "@/lib/avatar";

const quickLinks = [
  { label: "User Directory", description: "Manage users and invites", icon: Users, href: "/" },
  { label: "Roles & Access", description: "Permissions and RBAC", icon: Shield, href: "/roles-access" },
  { label: "Authentication", description: "SSO, 2FA, and policies", icon: FingerprintPatternIcon, href: "/auth-settings" },
  { label: "Audit Logs", description: "Security event history", icon: ClipboardList, href: "/audit-logs" },
];

const eventLabels: Record<string, string> = {
  granted_role: "Granted Role",
  failed_login: "Failed Login",
  file_deleted: "File Deleted",
  session_initiated: "Session Initiated",
  token_renewed: "Token Renewed",
  policy_violation: "Policy Violation",
};
const targetLabels: Record<string, string> = { iam_system: "IAM System", share: "Share", portfolio: "Portfolio" };
const statusLabels: Record<string, string> = { success: "Success", failed: "Failed", warning: "Warning" };

const getDashboardData = query(async () => {
  "use server";
  const [totalUsers, pendingInvites, twoFAUsers, activeSessions, rawLogs, rawSessions] =
    await Promise.all([
      prisma.user.count({ where: { banned: false } }),
      prisma.invitation.count({ where: { status: "pending" } }),
      prisma.user.count({ where: { twoFactorEnabled: true } }),
      prisma.session.count({ where: { expiresAt: { gt: new Date() } } }),
      prisma.auditLog.findMany({ orderBy: { timestamp: "desc" }, take: 5 }),
      prisma.session.findMany({
        where: { expiresAt: { gt: new Date() } },
        include: { user: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const twoFAAdoption = totalUsers > 0 ? ((twoFAUsers / totalUsers) * 100).toFixed(1) : "0.0";

  const isPrivateIp = (ip: string) =>
    /^(127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|::1|fc|fd|fe80|localhost|internal|N\/A)/i.test(ip);

  const logs: AuditLogEntry[] = await Promise.all(
    rawLogs.map(async (log) => {
      let location = log.location;
      const ip = log.ipAddress;

      if (ip && !isPrivateIp(ip) && (!location || location === "Unknown")) {
        const geo = await lookupIp(ip);
        if (geo) {
          location = geo.formatted;
          await prisma.auditLog.update({
            where: { id: log.id },
            data: { location: geo.formatted },
          });
        }
      }

      return {
        id: log.id,
        timestamp: log.timestamp.toISOString(),
        actorName: log.actorName,
        actorEmail: log.actorEmail,
        actorAvatarUrl: resolveAvatarUrl(log.actorAvatarUrl),
        actorInitials: log.actorInitials,
        event: (eventLabels[log.event] ?? log.event) as AuditLogEntry["event"],
        targetApp: (targetLabels[log.targetApp] ?? log.targetApp) as AuditLogEntry["targetApp"],
        ipAddress: ip ?? "N/A",
        location: location ?? "Unknown",
        status: (statusLabels[log.status] ?? log.status) as AuditLogEntry["status"],
      };
    }),
  );

  const sessions: ActiveSession[] = await Promise.all(
    rawSessions.map(async (s) => {
      const ua = s.userAgent ?? "";
      const deviceMatch = ua.match(/\(([^)]+)\)/);
      const device = deviceMatch ? deviceMatch[1].split(";")[0] : "Unknown Device";
      const browserMatch = ua.match(/(Chrome|Firefox|Safari|Edge|Opera|Arc)\/[\d.]+/);
      const browser = browserMatch ? browserMatch[0] : "Unknown Browser";

      let location = s.location;
      const ip = s.ipAddress;

      if (ip && !isPrivateIp(ip) && (!location || location === "Unknown")) {
        const geo = await lookupIp(ip);
        if (geo) {
          location = geo.formatted;
          await prisma.session.update({
            where: { id: s.id },
            data: { location: geo.formatted },
          });
        }
      }

      return {
        id: s.id,
        userName: s.user.name,
        userEmail: s.user.email,
        userInitials: s.user.initials ?? s.user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase(),
        userAvatarUrl: resolveAvatarUrl(s.user.image),
        device,
        browser,
        ipAddress: ip ?? "N/A",
        location: location ?? "Unknown",
        loginTime: s.createdAt.toISOString(),
        lastActivity: s.lastActivity?.toISOString() ?? s.createdAt.toISOString(),
        isCurrent: false,
      };
    }),
  );

  return {
    stats: { totalUsers, pendingInvites, twoFAAdoption: `${twoFAAdoption}%`, activeSessions },
    logs,
    sessions,
  };
}, "dashboardData");

export const route = {
  preload: () => getDashboardData(),
} satisfies RouteDefinition;

const DashboardPage: Component = () => {
  const data = createAsync(() => getDashboardData());

  const statCards = (): StatCardData[] => {
    const d = data();
    if (!d) return [];
    return [
      { label: "Total Active Users", value: d.stats.totalUsers.toLocaleString(), icon: Users },
      { label: "Pending Invites", value: d.stats.pendingInvites.toString(), icon: Activity },
      { label: "2FA Adoption Rate", value: d.stats.twoFAAdoption, icon: Shield },
      { label: "Active Sessions", value: d.stats.activeSessions.toString(), icon: Activity },
    ];
  };

  const recentLogs = () => data()?.logs?.slice(0, 5) ?? [];
  const recentSessions = () => data()?.sessions?.slice(0, 5) ?? [];

  return (
    <AuthGuard>
      <AppLayout>
        {/* Page Header */}
        <div class="mb-6">
          <h1 class="font-heading text-2xl font-semibold tracking-tight text-foreground md:text-[2rem] md:leading-10">
            Dashboard
          </h1>
          <p class="mt-1 text-sm text-muted-foreground">
            Overview of your identity and access management system.
          </p>
        </div>

        {/* Stat Cards */}
        <div class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <For each={statCards()}>{(card) => <StatCard card={card} />}</For>
        </div>

        {/* Quick Links */}
        <section class="mb-8">
          <h2 class="mb-3 font-heading text-base font-semibold text-foreground">
            Quick Access
          </h2>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <For each={quickLinks}>
              {(link) => (
                <A
                  href={link.href}
                  class="group flex items-start gap-4 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm transition-colors hover:border-primary/30 hover:shadow-md"
                >
                  <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent">
                    <link.icon size={20} aria-hidden="true" class="text-primary" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-1.5">
                      <span class="text-sm font-medium text-foreground">{link.label}</span>
                      <ArrowRight
                        size={14}
                        aria-hidden="true"
                        class="text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                      />
                    </div>
                    <p class="mt-0.5 text-xs text-muted-foreground">{link.description}</p>
                  </div>
                </A>
              )}
            </For>
          </div>
        </section>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Audit Logs */}
          <section>
            <div class="mb-3 flex items-center justify-between">
              <h2 class="font-heading text-base font-semibold text-foreground">
                Recent Activity
              </h2>
              <A
                href="/audit-logs"
                class="text-xs font-medium text-primary hover:underline"
              >
                View all
              </A>
            </div>
            <div class="rounded-xl border border-border bg-card shadow-sm">
              <For each={recentLogs()}>
                {(log, i) => (
                  <div
                    classList={{
                      "border-b border-border": i() < recentLogs().length - 1,
                    }}
                    class="flex items-center gap-3 px-4 py-3"
                  >
                    <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-primary">
                      {log.actorInitials}
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="truncate text-sm font-medium text-foreground">
                        {log.actorName}
                        <span class="font-normal text-muted-foreground">
                          {" "}
                          &middot; {log.event}
                        </span>
                      </p>
                      <p class="truncate text-xs text-muted-foreground">
                        {log.targetApp} &middot; {log.location}
                      </p>
                    </div>
                    <span
                      classList={{
                        "bg-green-50 text-green-700": log.status === "Success",
                        "bg-red-50 text-red-700": log.status === "Failed",
                        "bg-yellow-50 text-yellow-700": log.status === "Warning",
                      }}
                      class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
                    >
                      {log.status}
                    </span>
                  </div>
                )}
              </For>
            </div>
          </section>

          {/* Active Sessions */}
          <section>
            <div class="mb-3 flex items-center justify-between">
              <h2 class="font-heading text-base font-semibold text-foreground">
                Active Sessions
              </h2>
              <A
                href="/auth-settings"
                class="text-xs font-medium text-primary hover:underline"
              >
                Manage
              </A>
            </div>
            <div class="rounded-xl border border-border bg-card shadow-sm">
              <For each={recentSessions()}>
                {(sess, i) => (
                  <div
                    classList={{
                      "border-b border-border": i() < recentSessions().length - 1,
                    }}
                    class="flex items-center gap-3 px-4 py-3"
                  >
                    <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-primary">
                      {sess.userInitials}
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="truncate text-sm font-medium text-foreground">
                        {sess.userName}
                        {sess.isCurrent && (
                          <span class="ml-1.5 inline-block size-1.5 rounded-full bg-green-500" />
                        )}
                      </p>
                      <p class="truncate text-xs text-muted-foreground">
                        {sess.device} &middot; {sess.browser}
                      </p>
                    </div>
                    <span class="shrink-0 text-[10px] text-muted-foreground">
                      {sess.location}
                    </span>
                  </div>
                )}
              </For>
            </div>
          </section>
        </div>
      </AppLayout>
    </AuthGuard>
  );
};

export default DashboardPage;
