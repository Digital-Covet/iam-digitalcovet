import { For } from "solid-js";
import { Card } from "@/components/ui/card";
import type { StatCardData } from "@/types";

export function UserStatStrip(props: { stats: StatCardData[] }) {
  return (
    <div class="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <For each={props.stats}>
        {(stat) => (
          <Card class="flex items-center justify-between p-4">
            <div>
              <p class="text-[11px] font-medium uppercase tracking-[0.08em] text-foreground-muted">
                {stat.label}
              </p>
              <p class="mt-2 font-heading text-[28px] font-bold leading-none tabular-nums tracking-[-0.02em]">
                {stat.value}
              </p>
            </div>
            <stat.icon
              size={20}
              stroke-width={1.75}
              class="text-foreground-muted"
            />
          </Card>
        )}
      </For>
    </div>
  );
}
