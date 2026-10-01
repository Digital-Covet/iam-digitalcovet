import { Meta, Title } from "@solidjs/meta";
import { createAsync } from "@solidjs/router";
import { Show, Suspense } from "solid-js";
import { AppsView } from "@/components/apps/apps-view";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { getConnectedApps } from "@/lib/connected-apps";
import { pageMetadata } from "@/lib/seo";

export const route = {
  preload: () => getConnectedApps(),
};

export default function AppsPage() {
  const data = createAsync(() => getConnectedApps());

  return (
    <>
      <Title>{pageMetadata.apps.title}</Title>
      <Meta name="description" content={pageMetadata.apps.description} />
      <AppShell>
        <Suspense
          fallback={
            <PageHeader
              title="Connected Applications"
              subtitle="Single sign-on targets and OAuth2/OIDC client resource configurations"
            />
          }
        >
          <Show
            when={data()}
            fallback={
              <p class="rounded-lg border border-border bg-surface p-6 text-sm text-foreground-muted">
                Sign in to view your connected applications.
              </p>
            }
          >
            {(loaded) => <AppsView data={loaded()} />}
          </Show>
        </Suspense>
      </AppShell>
    </>
  );
}
