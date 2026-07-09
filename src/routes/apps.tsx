import type { Component } from "solid-js";
import { For } from "solid-js";
import { query, createAsync, type RouteDefinition } from "@solidjs/router";
import { AppWindow, Folder, Share2 } from "lucide-solid";
import AppLayout from "@/components/AppLayout";
import AuthGuard from "@/components/auth/auth-guard";
import AppCard from "@/components/apps/AppCard";
import type { AppItem, AppAccess } from "@/types";
import { prisma } from "@/db";
import { auth } from "@/lib/auth";
import { getRequestEvent } from "solid-js/web";

const apps: AppItem[] = [
  {
    id: "share",
    name: "Share",
    description: "File sharing and collaboration platform. Share documents, media, and files securely with your team.",
    url: "https://share.digitalcovet.com",
    icon: Share2,
    accessKey: "Share",
  },
  {
    id: "portfolio",
    name: "Portfolio",
    description: "Portfolio management system. Track, manage, and showcase your professional work and projects.",
    url: "https://portfolio.digitalcovet.com",
    icon: Folder,
    accessKey: "Portfolio",
  },
];

const elevatedRoles = new Set(["superadmin", "admin"]);

const getUserAccess = query(async () => {
  "use server";
  const event = getRequestEvent();
  if (!event) return { apps: [] as AppAccess[], elevated: false };

  const session = await auth.api.getSession({
    headers: event.request.headers,
  });

  if (!session?.user?.id) return { apps: [] as AppAccess[], elevated: false };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { appAccess: true, role: true },
  });

  if (!user) return { apps: [] as AppAccess[], elevated: false };

  const isElevated = elevatedRoles.has(user.role);
  const apps = isElevated
    ? (["Share", "Portfolio"] as AppAccess[])
    : ((user.appAccess ?? []) as AppAccess[]);

  return { apps, elevated: isElevated };
}, "userAppAccess");

export const route = {
  preload: () => getUserAccess(),
} satisfies RouteDefinition;

const AppsPage: Component = () => {
  const accessData = createAsync(() => getUserAccess());

  const hasAccess = (accessKey: AppAccess) => {
    const data = accessData();
    const apps = data?.apps;
    return Array.isArray(apps) && apps.includes(accessKey);
  };

  return (
    <AuthGuard>
      <AppLayout>
        {/* Page Header */}
        <div class="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
              <AppWindow size={22} aria-hidden="true" class="text-primary" />
            </div>
            <div>
              <h1 class="font-heading text-2xl font-semibold tracking-tight text-foreground md:text-[2rem] md:leading-10">
                Apps
              </h1>
              <p class="mt-1 text-sm text-muted-foreground">
                Access your connected applications and services.
              </p>
            </div>
          </div>
        </div>

        {/* App Cards */}
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <For each={apps}>
            {(app) => (
              <AppCard app={app} hasAccess={hasAccess(app.accessKey)} />
            )}
          </For>
        </div>
      </AppLayout>
    </AuthGuard>
  );
};

export default AppsPage;
