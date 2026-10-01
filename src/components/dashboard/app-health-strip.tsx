import { For } from "solid-js";
import { APP_ICONS } from "@/components/ui/app-icons";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import {
  CLIENT_STATUS_LABEL,
  CLIENT_STATUS_TONE,
} from "@/components/ui/status-tone";
import type { AppHealth } from "@/types";

const formatCount = (value: number) => value.toLocaleString("en-US");

function AppHealthCard(props: { health: AppHealth }) {
  const AppIcon = APP_ICONS[props.health.app];
  const status = () => props.health.status;

  return (
    <Card class="overflow-hidden">
      <div class="h-[3px] bg-primary" />
      <div class="space-y-3 p-4">
        <div class="flex items-center justify-between gap-2">
          <span class="flex items-center gap-2 font-heading text-[15px] font-semibold">
            <AppIcon
              size={16}
              stroke-width={1.75}
              class="text-primary dark:text-[#f87171]"
            />
            {props.health.app}
          </span>
          <StatusPill
            tone={CLIENT_STATUS_TONE[status()]}
            label={CLIENT_STATUS_LABEL[status()]}
          />
        </div>
        <dl class="grid grid-cols-2 gap-2 text-xs">
          <div>
            <dt class="text-foreground-muted">Authorized users</dt>
            <dd class="mt-0.5 font-mono text-sm tabular-nums">
              {formatCount(props.health.authorizedUsers)}
            </dd>
          </div>
          <div>
            <dt class="text-foreground-muted">Tokens / 24h</dt>
            <dd class="mt-0.5 font-mono text-sm tabular-nums">
              {formatCount(props.health.tokenExchanges24h)}
            </dd>
          </div>
        </dl>
      </div>
    </Card>
  );
}

export function AppHealthStrip(props: { apps: AppHealth[] }) {
  return (
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <For each={props.apps}>
        {(health) => <AppHealthCard health={health} />}
      </For>
    </div>
  );
}
