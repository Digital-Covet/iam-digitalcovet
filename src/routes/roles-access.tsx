import type { Component } from "solid-js";
import { Plus } from "lucide-solid";
import { query, createAsync, type RouteDefinition } from "@solidjs/router";
import AppLayout from "~/components/AppLayout";
import AuthGuard from "@/components/auth/auth-guard";
import RolesAccessPanel from "@/components/roles-access/RolesAccessPanel";
import type { Role } from "@/types";
import { prisma } from "@/db";

const getRoles = query(async () => {
  "use server";
  const roles = await prisma.role.findMany({
    include: { permissions: { include: { section: true } } },
    orderBy: { createdAt: "asc" },
  });

  return roles.map((role) => {
    const sectionMap = new Map<string, { id: string; title: string; permissions: { id: string; label: string; granted: boolean }[] }>();

    for (const perm of role.permissions) {
      if (!sectionMap.has(perm.sectionId)) {
        sectionMap.set(perm.sectionId, { id: perm.sectionId, title: perm.section.title, permissions: [] });
      }
      sectionMap.get(perm.sectionId)!.permissions.push({ id: perm.id, label: perm.label, granted: perm.granted });
    }

    return {
      id: role.id,
      name: role.name,
      description: role.description,
      summary: role.summary,
      isCustom: role.isCustom,
      sections: Array.from(sectionMap.values()),
    };
  });
}, "roles");

export const route = {
  preload: () => getRoles(),
} satisfies RouteDefinition;

const RolesAccessPage: Component = () => {
  const roles = createAsync(() => getRoles());

  return (
    <AuthGuard>
      <AppLayout>
      {/* Page header */}
      <div class="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 class="text-2xl font-semibold tracking-tight text-foreground md:text-[2rem] md:leading-10">
            Roles &amp; Permissions
          </h1>
          <p class="mt-1 text-sm text-muted-foreground">
            Manage access policies and system permissions across your organization.
          </p>
        </div>
        <button
          type="button"
          class="flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Plus size={14} aria-hidden="true" />
          Create Custom Role
        </button>
      </div>

      <RolesAccessPanel roles={roles() ?? []} />
      </AppLayout>
    </AuthGuard>
  );
};

export default RolesAccessPage;
