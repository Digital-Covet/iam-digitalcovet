import type { Component } from "solid-js";
import { createSignal, For } from "solid-js";
import { query, createAsync, type RouteDefinition } from "@solidjs/router";
import { Activity, Mail, ShieldCheck, Users } from "lucide-solid";
import AppLayout from "~/components/AppLayout";
import AuthGuard from "@/components/auth/auth-guard";
import PageHeader from "@/components/user-directory/PageHeader";
import StatCard from "@/components/user-directory/StatCard";
import UsersTable from "@/components/user-directory/UsersTable";
import InviteUserDrawer from "@/components/user-directory/InviteUserDrawer";
import type { InviteUserPayload } from "@/components/user-directory/InviteUserDrawer";
import type { AppAccess, StatCardData } from "@/types";
import { prisma } from "@/db";
import { auth } from "@/lib/auth";

const getUsers = query(async () => {
  "use server";
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      initials: true,
      role: true,
      twoFactorEnabled: true,
      appAccess: true,
      avatarTone: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    initials: u.initials ?? u.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase(),
    role: (u.role.charAt(0).toUpperCase() + u.role.slice(1)) as "SuperAdmin" | "Admin" | "Employee",
    mfaStatus: (u.twoFactorEnabled ? "Enabled" : "Disabled") as "Enabled" | "Disabled",
    appAccess: u.appAccess as ("Share" | "Portfolio")[],
    avatarTone: (u.avatarTone ?? "primary") as "primary" | "neutral",
  }));
}, "users");

const getStats = query(async () => {
  "use server";
  const [totalUsers, pendingInvites, twoFAUsers, activeSessions] =
    await Promise.all([
      prisma.user.count({ where: { banned: false } }),
      prisma.invitation.count({ where: { status: "pending" } }),
      prisma.user.count({ where: { twoFactorEnabled: true } }),
      prisma.session.count({ where: { expiresAt: { gt: new Date() } } }),
    ]);

  const twoFAAdoption = totalUsers > 0 ? ((twoFAUsers / totalUsers) * 100).toFixed(1) : "0.0";

  return { totalUsers, pendingInvites, twoFAAdoption: `${twoFAAdoption}%`, activeSessions };
}, "userStats");

const inviteUser = async (payload: InviteUserPayload) => {
  "use server";
  const appAccess: AppAccess[] = [];
  if (payload.shareAccess) appAccess.push("Share");
  if (payload.portfolioAccess) appAccess.push("Portfolio");

  const roleMap: Record<string, string> = {
    SuperAdmin: "superadmin",
    Admin: "admin",
    Employee: "employee",
  };

  await auth.api.createUser({
    body: {
      email: payload.email,
      name: `${payload.firstName} ${payload.lastName}`,
      role: (roleMap[payload.role] ?? "employee") as "user" | "admin",
      data: {
        appAccess,
        twoFactorEnabled: payload.requireMfa,
      },
    },
  });
};

export const route = {
  preload: () => Promise.all([getUsers(), getStats()]),
} satisfies RouteDefinition;

const App: Component = () => {
  const [drawerOpen, setDrawerOpen] = createSignal(false);
  const users = createAsync(() => getUsers());
  const stats = createAsync(() => getStats());

  const statCards = (): StatCardData[] => {
    const s = stats();
    if (!s) return [];
    return [
      { label: "Total Active Users", value: s.totalUsers.toLocaleString(), icon: Users },
      { label: "Pending Invites", value: s.pendingInvites.toString(), icon: Mail },
      { label: "2FA Adoption Rate", value: s.twoFAAdoption, icon: ShieldCheck },
      { label: "Active Sessions", value: s.activeSessions.toString(), icon: Activity },
    ];
  };

  return (
    <AuthGuard>
      <AppLayout>
        <PageHeader
          title="User Directory"
          subtitle="Manage enterprise access and identities."
          onInviteClick={() => setDrawerOpen(true)}
        />
        <div class="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <For each={statCards()}>{(card) => <StatCard card={card} />}</For>
        </div>
        <UsersTable users={users() ?? []} />
        <InviteUserDrawer
          open={drawerOpen()}
          onOpenChange={setDrawerOpen}
          onSubmit={inviteUser}
        />
      </AppLayout>
    </AuthGuard>
  );
};

export default App;
