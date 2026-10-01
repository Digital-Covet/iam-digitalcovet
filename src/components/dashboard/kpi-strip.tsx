import { For } from "solid-js";
import { Card } from "@/components/ui/card";
import { TONE_DOT, TONE_TEXT } from "@/components/ui/status-tone";
import type { DashboardMetric } from "@/types";

function MetricCard(props: { metric: DashboardMetric }) {
  return (
    <Card class="p-4">
      <p class="text-[11px] font-medium uppercase tracking-[0.08em] text-foreground-muted">{props.metric.label}</p>
      <p class="mt-2 font-heading text-[28px] font-bold leading-none tabular-nums tracking-[-0.02em]">
        {props.metric.value}
      </p>
      <p class={`mt-2 flex items-center gap-1.5 text-xs ${TONE_TEXT[props.metric.tone]}`}>
        <span class={`h-1.5 w-1.5 shrink-0 rounded-full ${TONE_DOT[props.metric.tone]}`} />
        {props.metric.detail}
      </p>
    </Card>
  );
}

const GRID_CLASS = "grid grid-cols-2 gap-4 lg:grid-cols-4";

export function KpiStrip(props: { metrics: DashboardMetric[] }) {
  return (
    <div class={GRID_CLASS}>
      <For each={props.metrics}>{(metric) => <MetricCard metric={metric} />}</For>
    </div>
  );
}

export function KpiStripSkeleton() {
  return (
    <div class={GRID_CLASS} aria-busy="true">
      <For each={[0, 1, 2, 3]}>{() => <Card class="h-[116px] animate-pulse" >{null}</Card>}</For>
    </div>
  );
}
