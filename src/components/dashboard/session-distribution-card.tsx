import { For, Show } from "solid-js";
import { Card, CardHeader } from "@/components/ui/card";
import type { SessionShare } from "@/types";

function ShareBar(props: { share: SessionShare }) {
  return (
    <li>
      <div class="mb-1 flex items-baseline justify-between text-[13.5px]">
        <span>{props.share.app}</span>
        <span class="font-mono text-xs tabular-nums text-foreground-muted">
          {props.share.sessions.toLocaleString("en-US")} · {props.share.percent}
          %
        </span>
      </div>
      <meter
        class="h-1.5 w-full appearance-none overflow-hidden rounded-full bg-surface-raised [&::-webkit-meter-bar]:bg-surface-raised [&::-webkit-meter-optimum-value]:bg-primary [&::-moz-meter-bar]:bg-primary"
        min={0}
        max={100}
        value={props.share.percent}
        aria-label={`${props.share.app} share of active sessions`}
      />
    </li>
  );
}

export function SessionDistributionCard(props: { shares: SessionShare[] }) {
  const hasSessions = () => props.shares.some((share) => share.sessions > 0);

  return (
    <Card>
      <CardHeader title="Session Distribution" />
      <div class="p-4">
        <Show
          when={hasSessions()}
          fallback={
            <p class="text-sm text-foreground-muted">
              No live sessions across connected apps.
            </p>
          }
        >
          <ul class="space-y-4">
            <For each={props.shares}>
              {(share) => <ShareBar share={share} />}
            </For>
          </ul>
        </Show>
      </div>
    </Card>
  );
}
