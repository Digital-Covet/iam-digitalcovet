import type { Component } from "solid-js";
import { ArrowUpRight } from "lucide-solid";
import type { AppItem } from "@/types";

interface AppCardProps {
  app: AppItem;
  hasAccess: boolean;
}

const AppCard: Component<AppCardProps> = (props) => {
  const Icon = props.app.icon;

  return (
    <div class="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:shadow-md">
      <div class="mb-4 flex items-center gap-3">
        <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent">
          <Icon size={20} aria-hidden="true" class="text-primary" />
        </div>
        <div class="min-w-0 flex-1">
          <h3 class="text-sm font-semibold text-foreground">{props.app.name}</h3>
          <p class="truncate text-xs text-muted-foreground">{props.app.url.replace("https://", "")}</p>
        </div>
        <span
          classList={{
            "bg-green-50 text-green-700": props.hasAccess,
            "bg-zinc-100 text-zinc-500": !props.hasAccess,
          }}
          class="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium"
        >
          {props.hasAccess ? "Access Granted" : "No Access"}
        </span>
      </div>

      <p class="mb-4 flex-1 text-sm text-muted-foreground">
        {props.app.description}
      </p>

      <a
        href={props.hasAccess ? props.app.url : undefined}
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={!props.hasAccess}
        tabIndex={props.hasAccess ? 0 : -1}
        classList={{
          "pointer-events-none opacity-50 cursor-not-allowed": !props.hasAccess,
          "hover:bg-primary/90 hover:text-primary-foreground": props.hasAccess,
        }}
        class="flex items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        Open App
        <ArrowUpRight size={12} aria-hidden="true" />
      </a>
    </div>
  );
};

export default AppCard;
