import { For, Show } from "solid-js";
import { Card, CardHeader } from "@/components/ui/card";
import type { SessionShare } from "@/types";

function ShareBar(props: { share: SessionShare }) {
  return (
    <li>
      <div class="mb-1 flex items-baseline justify-between text-[13.5px]">
        <span>{props.share.app}</span>
        <span class="font-mono text-xs tabular-nums text-foreground-muted">
          {props.share.sessions.toLocaleString("en-US")} · {props.share.percent}%
        </span>
      </div>
      <div
        class="h-1.5 overflow-hidden rounded-full bg-surface-raised"
        role="meter"
        aria-label={`${props.share.app} share of active sessions`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={props.share.percent}
      >
        <div class="h-full rounded-full bg-primary" style={{ width: `${props.share.percent}%` }} />
      </div>
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
          fallback={<p class="text-sm text-foreground-muted">No live sessions across connected apps.</p>}
        >
          <ul class="space-y-4">
            <For each={props.shares}>{(share) => <ShareBar share={share} />}</For>
          </ul>
        </Show>
      </div>
    </Card>
  );
}
