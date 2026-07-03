import type { Component } from "solid-js";
import type { AuditLogStatus } from "@/types";

const statusConfig: Record<
  AuditLogStatus,
  { dotClass: string; ringClass: string; textClass: string; color: string }
> = {
  Success: {
    dotClass: "bg-emerald-500",
    ringClass: "ring-emerald-500/30",
    textClass: "text-emerald-600 dark:text-emerald-400",
    color: "#10b981",
  },
  Failed: {
    dotClass: "bg-primary",
    ringClass: "ring-primary/30",
    textClass: "text-primary",
    color: "var(--primary)",
  },
  Warning: {
    dotClass: "bg-amber-500",
    ringClass: "ring-amber-500/30",
    textClass: "text-amber-600 dark:text-amber-400",
    color: "#f59e0b",
  },
};

const AuditLogStatusIndicator: Component<{ status: AuditLogStatus }> = (
  props,
) => {
  const config = () => statusConfig[props.status];

  return (
    <div class="flex items-center gap-2">
      <span class="relative flex h-2.5 w-2.5">
        <span
          class={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${config().dotClass}`}
        />
        <span
          class={`relative inline-flex h-2.5 w-2.5 rounded-full ring-2 ${config().dotClass} ${config().ringClass}`}
        />
      </span>
      <span class={`text-sm font-medium ${config().textClass}`}>
        {props.status}
      </span>
    </div>
  );
};

export default AuditLogStatusIndicator;
