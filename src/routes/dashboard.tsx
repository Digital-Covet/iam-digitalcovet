import { Meta, Title } from "@solidjs/meta";
import { createAsync } from "@solidjs/router";
import { Show, Suspense } from "solid-js";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { KpiStripSkeleton } from "@/components/dashboard/kpi-strip";
import { AppShell } from "@/components/layout/app-shell";
import { BUTTON_OUTLINE, BUTTON_PRIMARY, PageHeader } from "@/components/ui/page-header";
import { getDashboardData } from "@/lib/dashboard";
import { pageMetadata } from "@/lib/seo";

export const route = {
  preload: () => getDashboardData(),
};

function DashboardActions() {
  return (
    <>
      <a href="/audit-logs" class={BUTTON_OUTLINE}>
        Export Audit Report
      </a>
      <a href="/" class={BUTTON_PRIMARY}>
        Invite User
      </a>
    </>
  );
}

export default function DashboardPage() {
  const data = createAsync(() => getDashboardData());

  return (
    <>
      <Title>{pageMetadata.dashboard.title}</Title>
      <Meta name="description" content={pageMetadata.dashboard.description} />
      <AppShell>
        <PageHeader
          title="System Overview & Telemetry"
          subtitle="Live session monitoring and identity security posture"
          actions={<DashboardActions />}
        />
        <Suspense fallback={<KpiStripSkeleton />}>
          <Show
            when={data()}
            fallback={
              <p class="rounded-lg border border-border bg-surface p-6 text-sm text-foreground-muted">
                The dashboard is available to administrators only.
              </p>
            }
          >
            {(loaded) => <DashboardView data={loaded()} />}
          </Show>
        </Suspense>
      </AppShell>
    </>
  );
}
