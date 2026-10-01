import { For, Show } from "solid-js";
import { Card, CardHeader } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { AUDIT_OUTCOME_TONE } from "@/components/ui/status-tone";
import { formatUtcTimestamp } from "@/lib/format-date";
import type { AuditLogEntry } from "@/types";

const HEAD_CELL =
  "px-4 py-2 text-left text-[11px] font-medium uppercase tracking-[0.08em] text-foreground-muted";
const WIDE_ONLY = "hidden md:table-cell";

function AuditRow(props: { entry: AuditLogEntry }) {
  return (
    <tr class="h-9 border-t border-border-subtle transition-colors hover:bg-primary/5">
      <td
        class={`px-4 font-mono text-xs tabular-nums text-foreground-muted ${WIDE_ONLY}`}
      >
        {formatUtcTimestamp(props.entry.timestamp)}
      </td>
      <td
        class="max-w-[200px] truncate px-4 text-[13.5px]"
        title={props.entry.actorEmail}
      >
        {props.entry.actorName}
      </td>
      <td class="px-4 text-[13.5px]">{props.entry.event}</td>
      <td class={`px-4 text-[13.5px] ${WIDE_ONLY}`}>{props.entry.targetApp}</td>
      <td class="px-4">
        <StatusPill
          tone={AUDIT_OUTCOME_TONE[props.entry.status]}
          label={props.entry.status}
        />
      </td>
    </tr>
  );
}

export function LiveAuditFeed(props: { entries: AuditLogEntry[] }) {
  return (
    <Card>
      <CardHeader
        title="Live Security Stream"
        aside={
          <span class="font-mono text-xs text-foreground-muted">
            Refreshed live
          </span>
        }
      />
      <Show
        when={props.entries.length > 0}
        fallback={
          <p class="px-4 py-8 text-center text-sm text-foreground-muted">
            All system auth services nominal.
          </p>
        }
      >
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr>
                <th class={`${HEAD_CELL} ${WIDE_ONLY}`}>Timestamp</th>
                <th class={HEAD_CELL}>Actor</th>
                <th class={HEAD_CELL}>Action</th>
                <th class={`${HEAD_CELL} ${WIDE_ONLY}`}>App Target</th>
                <th class={HEAD_CELL}>Status</th>
              </tr>
            </thead>
            <tbody>
              <For each={props.entries}>
                {(entry) => <AuditRow entry={entry} />}
              </For>
            </tbody>
          </table>
        </div>
      </Show>
    </Card>
  );
}
