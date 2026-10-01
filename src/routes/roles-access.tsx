import { Meta, Title } from "@solidjs/meta";
import { createAsync } from "@solidjs/router";
import { Show, Suspense } from "solid-js";
import { AppShell } from "@/components/layout/app-shell";
import { RolesAccessView } from "@/components/roles-access/roles-access-view";
import { PageHeader } from "@/components/ui/page-header";
import { pageMetadata } from "@/lib/seo";
import { getRolesAccess } from "@/lib/roles-access";

export const route = {
  preload: () => getRolesAccess(),
};

export default function RolesAccessPage() {
  const data = createAsync(() => getRolesAccess());

  return (
    <>
      <Title>{pageMetadata.rolesAccess.title}</Title>
      <Meta name="description" content={pageMetadata.rolesAccess.description} />
      <AppShell>
        <Suspense
          fallback={
            <PageHeader
              title="Roles & Permission Sets"
              subtitle="Define ecosystem privilege boundaries and resource access limits"
            />
          }
        >
          <Show
            when={data()}
            fallback={
              <p class="rounded-lg border border-border bg-surface p-6 text-sm text-foreground-muted">
                Roles and permissions are available to administrators only.
              </p>
            }
          >
            {(loaded) => <RolesAccessView data={loaded()} />}
          </Show>
        </Suspense>
      </AppShell>
    </>
  );
}
