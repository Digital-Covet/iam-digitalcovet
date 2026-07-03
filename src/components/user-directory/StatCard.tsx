import type { Component } from "solid-js";
import type { StatCardData } from "@/types";

const StatCard: Component<{ card: StatCardData }> = (props) => (
  <div class="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-[0_4px_6px_-1px_rgb(0,0,0,0.05),0_2px_4px_-2px_rgb(0,0,0,0.05)]">
    <div class="mb-2 flex items-center justify-between">
      <span class="text-xs font-medium tracking-wide text-muted-foreground">
        {props.card.label}
      </span>
      <props.card.icon size={22} aria-hidden="true" class="text-muted-foreground" />
    </div>
    <div class="text-[2rem] font-semibold leading-10 tracking-tight">
      {props.card.value}
    </div>
  </div>
);

export default StatCard;
