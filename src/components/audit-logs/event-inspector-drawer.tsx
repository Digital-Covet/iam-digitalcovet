import { For, Show } from "solid-js";
import { JsonCodeBlock } from "@/components/audit-logs/json-code-block";
import { Drawer } from "@/components/ui/drawer";
import { StatusPill } from "@/components/ui/status-pill";
import { AUDIT_OUTCOME_TONE } from "@/components/ui/status-tone";
import { toInspectorJson, toShortEventId } from "@/lib/audit-ledger-model";
import { formatUtcTimestamp } from "@/lib/format-date";
import type { AuditLedgerEntry } from "@/types";

interface EventInspectorDrawerProps {
  entry: AuditLedgerEntry | null;
  onClose: () => void;
}

function metaRows(entry: AuditLedgerEntry): [label: string, value: string][] {
  return [
    ["Timestamp (UTC)", formatUtcTimestamp(entry.timestamp)],
    ["Actor", `${entry.actorName} <${entry.actorEmail}>`],
    ["Actor UUID", entry.actorUserId ?? "N/A"],
    ["Event Key", entry.eventKey],
    ["Target App", entry.targetApp],
    ["IP Address", entry.ipAddress],
    ["Location", entry.location],
  ];
}

export function EventInspectorDrawer(props: EventInspectorDrawerProps) {
  return (
    <Drawer
      open={props.entry !== null}
      title={
        props.entry
          ? `Event Telemetry: ${toShortEventId(props.entry.id)}`
          : "Event Telemetry"
      }
      description="Full context recorded for this security event"
      onOpenChange={(open) => !open && props.onClose()}
    >
      <Show when={props.entry}>
        {(entry) => (
          <div class="space-y-5">
            <StatusPill
              tone={AUDIT_OUTCOME_TONE[entry().status]}
              label={entry().status}
            />
            <dl class="grid grid-cols-[120px_1fr] gap-x-4 gap-y-2.5 text-[13px]">
              <For each={metaRows(entry())}>
                {([label, value]) => (
                  <>
                    <dt class="text-foreground-muted">{label}</dt>
                    <dd class="min-w-0 break-words font-mono text-xs text-foreground">
                      {value}
                    </dd>
                  </>
                )}
              </For>
            </dl>
            <JsonCodeBlock json={toInspectorJson(entry())} />
          </div>
        )}
      </Show>
    </Drawer>
  );
}
