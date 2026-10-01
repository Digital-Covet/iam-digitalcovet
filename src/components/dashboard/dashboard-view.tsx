import { AppHealthStrip } from "@/components/dashboard/app-health-strip";
import { KpiStrip } from "@/components/dashboard/kpi-strip";
import { LiveAuditFeed } from "@/components/dashboard/live-audit-feed";
import { SecurityPostureCard } from "@/components/dashboard/security-posture-card";
import { SessionDistributionCard } from "@/components/dashboard/session-distribution-card";
import type { DashboardData } from "@/types";

export function DashboardView(props: { data: DashboardData }) {
  return (
    <div class="space-y-6">
      <KpiStrip metrics={props.data.metrics} />
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div class="space-y-4 lg:col-span-8">
          <AppHealthStrip apps={props.data.apps} />
          <LiveAuditFeed entries={props.data.recentEvents} />
        </div>
        <div class="space-y-4 lg:col-span-4">
          <SessionDistributionCard shares={props.data.sessionShares} />
          <SecurityPostureCard posture={props.data.posture} />
        </div>
      </div>
    </div>
  );
}
