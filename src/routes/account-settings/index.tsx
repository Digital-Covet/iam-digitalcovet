import type { Component } from "solid-js";
import { Show } from "solid-js";
import { query, createAsync, type RouteDefinition, useNavigate } from "@solidjs/router";
import { Settings } from "lucide-solid";
import AppLayout from "@/components/AppLayout";
import AuthGuard from "@/components/auth/auth-guard";
import ProfileCard from "@/components/account-settings/ProfileCard";
import SecurityCard from "@/components/account-settings/SecurityCard";
import ActiveSessionsList from "@/components/account-settings/ActiveSessionsList";
import type { AccountSettingsData, UserProfile } from "@/types";
import { prisma } from "@/db";

const getAccountData = query(async () => {
  "use server";
  const { auth } = await import("@/lib/auth");

  const session = await auth.api.getSession({
    headers: new Headers(),
  });

  if (!session?.user) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      sessions: {
        where: { expiresAt: { gt: new Date() } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    return null;
  }

  const activeSessions = user.sessions.map((s) => {
    const ua = s.userAgent ?? "";
    const deviceMatch = ua.match(/\(([^)]+)\)/);
    const device = deviceMatch ? deviceMatch[1].split(";")[0] : "Unknown Device";
    const browserMatch = ua.match(/(Chrome|Firefox|Safari|Edge|Opera|Arc)\/[\d.]+/);
    const browser = browserMatch ? browserMatch[0] : "Unknown Browser";

    return {
      id: s.id,
      userName: user.name,
      userEmail: user.email,
      userInitials: user.initials ?? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase(),
      userAvatarUrl: user.image ?? undefined,
      device,
      browser,
      ipAddress: s.ipAddress ?? "N/A",
      location: s.location ?? "Unknown",
      loginTime: s.createdAt.toISOString(),
      lastActivity: s.lastActivity?.toISOString() ?? s.createdAt.toISOString(),
      isCurrent: s.token === session.session?.token,
    };
  });

  const roleLabels: Record<string, string> = {
    employee: "Employee",
    admin: "Admin",
    superadmin: "SuperAdmin",
  };

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      initials: user.initials ?? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase(),
      role: (roleLabels[user.role] ?? user.role) as UserProfile["role"],
      department: user.departmentId,
      avatarUrl: user.image,
      twoFactorEnabled: user.twoFactorEnabled ?? false,
      createdAt: user.createdAt.toISOString(),
    },
    activeSessions,
  };
}, "accountData");

export const route = {
  preload: () => getAccountData(),
} satisfies RouteDefinition;

const AccountSettingsPage: Component = () => {
  const data = createAsync(() => getAccountData());
  const navigate = useNavigate();

  return (
    <AuthGuard>
      <AppLayout>
        <div class="mb-6">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
              <Settings size={22} aria-hidden="true" class="text-primary" />
            </div>
            <div>
              <h1 class="font-heading text-2xl font-semibold tracking-tight text-foreground md:text-[2rem] md:leading-10">
                Account Settings
              </h1>
              <p class="mt-1 text-sm text-muted-foreground">
                Manage your profile, security preferences, and active sessions.
              </p>
            </div>
          </div>
        </div>

        <Show when={data()} fallback={<div class="text-muted-foreground">Loading...</div>}>
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ProfileCard user={data()!.user} />
            <SecurityCard
              twoFactorEnabled={data()!.user.twoFactorEnabled}
              userId={data()!.user.id}
            />
          </div>

          <div class="mt-6">
            <ActiveSessionsList
              sessions={data()!.activeSessions}
              currentSessionId={data()!.activeSessions.find((s) => s.isCurrent)?.id}
            />
          </div>
        </Show>
      </AppLayout>
    </AuthGuard>
  );
};

export default AccountSettingsPage;
