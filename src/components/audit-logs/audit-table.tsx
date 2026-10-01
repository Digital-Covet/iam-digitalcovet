import { Pagination } from "@ark-ui/solid/pagination";
import ChevronLeft from "lucide-solid/icons/chevron-left";
import ChevronRight from "lucide-solid/icons/chevron-right";
import Code from "lucide-solid/icons/code";
import Globe from "lucide-solid/icons/globe";
import { For, Show } from "solid-js";
import { Card } from "@/components/ui/card";
import { BUTTON_OUTLINE } from "@/components/ui/page-header";
import { StatusPill } from "@/components/ui/status-pill";
import { AppTooltip } from "@/components/ui/tooltip";
import { AUDIT_OUTCOME_TONE } from "@/components/ui/status-tone";
import { formatUtcTimestamp } from "@/lib/format-date";
import type { AuditLedgerEntry, AuditLedgerPage } from "@/types";

const HEAD_CELL = "px-4 py-2 text-left text-[11px] font-medium uppercase tracking-[0.08em] text-foreground-muted";
const WIDE_ONLY = "hidden md:table-cell";
const PAGER_BUTTON = `${BUTTON_OUTLINE} px-2.5 disabled:opacity-50`;

interface AuditTableProps {
  ledger: AuditLedgerPage;
  hasActiveFilters: boolean;
  onInspect: (entry: AuditLedgerEntry) => void;
  onPageChange: (page: number) => void;
  onClearFilters: () => void;
}

function AuditRow(props: { entry: AuditLedgerEntry; onInspect: (entry: AuditLedgerEntry) => void }) {
  return (
    <tr class="h-9 border-t border-border-subtle transition-colors hover:bg-primary/5">
      <td class="whitespace-nowrap px-4 font-mono text-xs tabular-nums text-foreground-muted">
        {formatUtcTimestamp(props.entry.timestamp)}
      </td>
      <td class="max-w-[220px] truncate px-4 text-[13.5px]" title={props.entry.actorEmail}>
        {props.entry.actorEmail}
      </td>
      <td class="px-4">
        <span class="whitespace-nowrap rounded bg-surface-raised px-1.5 py-0.5 font-mono text-xs">{props.entry.eventKey}</span>
      </td>
      <td class={`px-4 ${WIDE_ONLY}`}>
        <span class="rounded bg-surface-raised px-1.5 py-0.5 text-xs font-medium">{props.entry.targetApp}</span>
      </td>
      <td class={`whitespace-nowrap px-4 ${WIDE_ONLY}`}>
        <span class="font-mono text-xs tabular-nums">{props.entry.ipAddress}</span>
        <span class="ml-2 inline-flex items-center gap-1 text-xs text-foreground-muted">
          <Globe size={12} stroke-width={1.5} />
          {props.entry.location}
        </span>
      </td>
      <td class="px-4">
        <StatusPill tone={AUDIT_OUTCOME_TONE[props.entry.status]} label={props.entry.status} />
      </td>
      <td class="px-4 text-right">
        <AppTooltip content={`Inspect JSON for ${props.entry.eventKey}`}>
          <button
            type="button"
            onClick={() => props.onInspect(props.entry)}
            aria-label={`Inspect JSON for ${props.entry.eventKey} at ${formatUtcTimestamp(props.entry.timestamp)}`}
            class="inline-flex h-8 items-center gap-1.5 rounded px-2 text-xs font-medium text-foreground-muted transition-colors duration-[120ms] hover:bg-surface-raised hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            <Code size={14} stroke-width={1.75} />
            <span class="hidden sm:inline">Inspect JSON</span>
          </button>
        </AppTooltip>
      </td>
    </tr>
  );
}

function Pager(props: { ledger: AuditLedgerPage; onPageChange: (page: number) => void }) {
  const first = () => (props.ledger.page - 1) * props.ledger.pageSize + 1;
  const last = () => first() + props.ledger.entries.length - 1;

  return (
    <Pagination.Root
      count={props.ledger.total}
      pageSize={props.ledger.pageSize}
      page={props.ledger.page}
      siblingCount={0}
      onPageChange={(details) => {
        if (details.page !== props.ledger.page) props.onPageChange(details.page);
      }}
    >
      <footer class="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
        <Pagination.Context>
          {(pagination) => (
            <span class="font-mono text-xs tabular-nums text-foreground-muted" aria-live="polite">
              Showing {first()}–{last()} of {pagination().count.toLocaleString("en-US")} events
            </span>
          )}
        </Pagination.Context>
        <div class="flex items-center gap-2">
          <Pagination.PrevTrigger class={PAGER_BUTTON} aria-label="Previous page">
            <ChevronLeft size={16} stroke-width={1.75} />
          </Pagination.PrevTrigger>
          <Pagination.NextTrigger class={PAGER_BUTTON} aria-label="Next page">
            <ChevronRight size={16} stroke-width={1.75} />
          </Pagination.NextTrigger>
        </div>
      </footer>
    </Pagination.Root>
  );
}

function EmptyState(props: { hasActiveFilters: boolean; onClearFilters: () => void }) {
  return (
    <div class="px-4 py-12 text-center text-sm text-foreground-muted">
      <p>{props.hasActiveFilters ? "No events match the current filters." : "No security events have been recorded yet."}</p>
      <Show when={props.hasActiveFilters}>
        <button type="button" onClick={props.onClearFilters} class="mt-2 font-medium text-primary underline-offset-2 hover:underline dark:text-red-400">
          Clear all filters
        </button>
      </Show>
    </div>
  );
}

export function AuditTable(props: AuditTableProps) {
  return (
    <Card>
      <Show
        when={props.ledger.entries.length > 0}
        fallback={<EmptyState hasActiveFilters={props.hasActiveFilters} onClearFilters={props.onClearFilters} />}
      >
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr>
                <th class={HEAD_CELL}>Timestamp (UTC)</th>
                <th class={HEAD_CELL}>Actor</th>
                <th class={HEAD_CELL}>Event Type</th>
                <th class={`${HEAD_CELL} ${WIDE_ONLY}`}>Target App</th>
                <th class={`${HEAD_CELL} ${WIDE_ONLY}`}>IP & Geo</th>
                <th class={HEAD_CELL}>Outcome</th>
                <th class={`${HEAD_CELL} text-right`}>Payload</th>
              </tr>
            </thead>
            <tbody>
              <For each={props.ledger.entries}>{(entry) => <AuditRow entry={entry} onInspect={props.onInspect} />}</For>
            </tbody>
          </table>
        </div>
        <Pager ledger={props.ledger} onPageChange={props.onPageChange} />
      </Show>
    </Card>
  );
}
