import type { Component } from "solid-js";
import { createSignal, For } from "solid-js";
import { query, createAsync, type RouteDefinition } from "@solidjs/router";
import { Settings2, ShieldCheck, ShieldHalf, Activity, Lock, Globe } from "lucide-solid";
import AppLayout from "@/components/AppLayout";
import AuthGuard from "@/components/auth/auth-guard";
import StatCard from "@/components/user-directory/StatCard";
import AuthMethodCard from "@/components/auth-settings/AuthMethodCard";
import PasswordPolicyCard from "@/components/auth-settings/PasswordPolicyCard";
import ActiveSessionsTable from "@/components/auth-settings/ActiveSessionsTable";
import type { AuthMethod, PasswordPolicy, ActiveSession, StatCardData } from "@/types";
import { prisma } from "@/db";
import { lookupIp } from "@/lib/ip-geolocation";

const providerLabels: Record<string, string> = {
  password: "Password",
  two_factor: "TwoFactor",
  sso_saml: "SSO_SAML",
  sso_oidc: "SSO_OIDC",
  google: "Google",
  microsoft: "Microsoft",
  github: "GitHub",
};
const statusLabels: Record<string, string> = { enabled: "Enabled", disabled: "Disabled", configuring: "Configuring" };

const getAuthData = query(async () => {
  "use server";
  const [methods, policies, sessions, totalUsers, twoFAUsers, failedLogins24h, ssoAccounts] =
    await Promise.all([
      prisma.authMethodConfig.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.passwordPolicy.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.session.findMany({
        where: { expiresAt: { gt: new Date() } },
        include: { user: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where: { banned: false } }),
      prisma.user.count({ where: { twoFactorEnabled: true } }),
      prisma.auditLog.count({
        where: {
          event: "failed_login",
          timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.account.findMany({
        where: { providerId: { in: ["saml", "oidc", "google", "microsoft"] } },
        distinct: ["userId"],
      }),
    ]);

  const formattedMethods: AuthMethod[] = methods.map((m) => ({
    id: m.id,
    provider: (providerLabels[m.provider] ?? m.provider) as AuthMethod["provider"],
    label: m.label,
    description: m.description,
    status: (statusLabels[m.status] ?? m.status) as AuthMethod["status"],
    enrolledUsers: m.enrolledUsers,
    lastUpdated: m.lastUpdated?.toISOString() ?? new Date().toISOString(),
  }));

  const formattedPolicies: PasswordPolicy[] = policies.map((p) => ({
    id: p.id,
    label: p.label,
    description: p.description,
    value: p.value as string | number | boolean,
    enabled: p.enabled,
  }));

  const isPrivateIp = (ip: string) =>
    /^(127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|::1|fc|fd|fe80|localhost|internal|N\/A)/i.test(ip);

  const formattedSessions: ActiveSession[] = await Promise.all(
    sessions.map(async (s) => {
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
        userAvatarUrl: s.user.image,
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

  const twoFAAdoption = totalUsers > 0 ? ((twoFAUsers / totalUsers) * 100).toFixed(1) : "0.0";

  return {
    methods: formattedMethods,
    policies: formattedPolicies,
    sessions: formattedSessions,
    stats: {
      twoFAAdoption: `${twoFAAdoption}%`,
      activeSessions: sessions.length,
      failedLogins24h,
      ssoUsers: ssoAccounts.length,
    },
  };
}, "authData");

export const route = {
  preload: () => getAuthData(),
} satisfies RouteDefinition;

const AuthenticationPage: Component = () => {
  const data = createAsync(() => getAuthData());
  const [methods, setMethods] = createSignal<AuthMethod[]>([]);
  const [policies, setPolicies] = createSignal<PasswordPolicy[]>([]);

  const syncFromServer = () => {
    const d = data();
    if (d) {
      setMethods(d.methods);
      setPolicies(d.policies);
    }
  };

  // Sync once data loads
  if (data()) syncFromServer();

  const handleMethodToggle = (id: string, enabled: boolean) => {
    setMethods((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, status: enabled ? "Enabled" : "Disabled" } : m,
      ),
    );
  };

  const handlePolicyToggle = (id: string, enabled: boolean) => {
    setPolicies((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled } : p)),
    );
  };

  const authStatCards = (): StatCardData[] => {
    const d = data();
    if (!d) return [];
    return [
      { label: "2FA Adoption Rate", value: d.stats.twoFAAdoption, icon: ShieldHalf },
      { label: "Active Sessions", value: d.stats.activeSessions.toString(), icon: Activity },
      { label: "Failed Logins (24h)", value: d.stats.failedLogins24h.toString(), icon: Lock },
      { label: "SSO Users", value: d.stats.ssoUsers.toString(), icon: Globe },
    ];
  };

  return (
    <AuthGuard>
      <AppLayout>
      {/* ─── Page Header ─── */}
      <div class="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
            <ShieldCheck size={22} aria-hidden="true" class="text-primary" />
          </div>
          <div>
            <h1 class="font-heading text-2xl font-semibold tracking-tight text-foreground md:text-[2rem] md:leading-10">
              Authentication
            </h1>
            <p class="mt-1 text-sm text-muted-foreground">
              Manage authentication methods, password policies, and monitor active sessions across your organization.
            </p>
          </div>
        </div>
        <div class="flex gap-3">
          <button
            type="button"
            class="flex items-center rounded-md border border-border px-4 py-2 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Settings2 size={14} aria-hidden="true" class="mr-1.5" />
            Advanced Settings
          </button>
          <button
            type="button"
            class="flex items-center rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Configure SSO
          </button>
        </div>
      </div>

      {/* ─── Stat Cards ─── */}
      <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <For each={authStatCards()}>
          {(card) => <StatCard card={card} />}
        </For>
      </div>

      {/* ─── Authentication Methods ─── */}
      <section class="mb-6">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="font-heading text-base font-semibold text-foreground">
            Authentication Methods
          </h2>
          <span class="text-xs text-muted-foreground">
            {methods().filter((m) => m.status === "Enabled").length} of{" "}
            {methods().length} enabled
          </span>
        </div>
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <For each={methods()}>
            {(method) => (
              <AuthMethodCard method={method} onToggle={handleMethodToggle} />
            )}
          </For>
        </div>
      </section>

      {/* ─── Password Policy ─── */}
      <section class="mb-6">
        <PasswordPolicyCard
          policies={policies()}
          onToggle={handlePolicyToggle}
        />
      </section>

      {/* ─── Active Sessions ─── */}
      <section>
        <ActiveSessionsTable sessions={data()?.sessions ?? []} />
      </section>
      </AppLayout>
    </AuthGuard>
  );
};

export default AuthenticationPage;
