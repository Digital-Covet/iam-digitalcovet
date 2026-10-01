import { For } from "solid-js";
import { Card, CardHeader } from "@/components/ui/card";
import { TONE_DOT } from "@/components/ui/status-tone";
import type { SecurityPosture, StatusTone } from "@/types";

interface PostureRow {
  label: string;
  value: number;
  tone: StatusTone;
}

function toRows(posture: SecurityPosture): PostureRow[] {
  return [
    { label: "Pending invitations", value: posture.pendingInvitations, tone: "neutral" },
    { label: "Users without 2FA", value: posture.unenrolledUsers, tone: posture.unenrolledUsers > 0 ? "warning" : "success" },
    { label: "Suspended accounts", value: posture.bannedUsers, tone: posture.bannedUsers > 0 ? "critical" : "success" },
  ];
}

export function SecurityPostureCard(props: { posture: SecurityPosture }) {
  return (
    <Card>
      <CardHeader title="Security Posture" />
      <ul class="divide-y divide-border-subtle">
        <For each={toRows(props.posture)}>
          {(row) => (
            <li class="flex items-center justify-between px-4 py-3 text-[13.5px]">
              <span class="flex items-center gap-2">
                <span class={`h-1.5 w-1.5 rounded-full ${TONE_DOT[row.tone]}`} />
                {row.label}
              </span>
              <span class="font-mono text-sm tabular-nums">{row.value.toLocaleString("en-US")}</span>
            </li>
          )}
        </For>
      </ul>
    </Card>
  );
}
