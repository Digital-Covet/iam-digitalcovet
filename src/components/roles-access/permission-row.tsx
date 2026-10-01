import Check from "lucide-solid/icons/check";
import Minus from "lucide-solid/icons/minus";
import UserCog from "lucide-solid/icons/user-cog";
import { Match, Switch } from "solid-js";
import { StatusPill } from "@/components/ui/status-pill";
import type { RolePermission } from "@/types";

function AccessIndicator(props: { access: RolePermission["access"] }) {
  return (
    <Switch>
      <Match when={props.access === "granted"}>
        <span class="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 dark:text-emerald-400">
          <Check size={14} stroke-width={2.25} /> Granted
        </span>
      </Match>
      <Match when={props.access === "per-user"}>
        <span class="inline-flex items-center gap-1.5 text-xs font-medium text-foreground-muted">
          <UserCog size={14} stroke-width={1.75} /> Assigned per user
        </span>
      </Match>
      <Match when={props.access === "denied"}>
        <span class="inline-flex items-center gap-1.5 text-xs text-foreground-muted">
          <Minus size={14} stroke-width={1.75} /> Denied
        </span>
      </Match>
    </Switch>
  );
}

export function PermissionRow(props: { permission: RolePermission }) {
  return (
    <li class="flex min-h-9 items-center justify-between gap-3 px-4 py-2 hover:bg-primary/5">
      <div class="flex min-w-0 flex-wrap items-center gap-2">
        <span class="text-[13.5px] leading-[1.45] text-foreground">
          {props.permission.label}
        </span>
        {props.permission.elevated && (
          <StatusPill tone="warning" label="Elevated" />
        )}
      </div>
      <div class="flex shrink-0 items-center gap-3">
        <code class="hidden font-mono text-xs text-foreground-muted sm:inline">
          {props.permission.key}
        </code>
        <div class="w-36 sm:flex sm:justify-end">
          <AccessIndicator access={props.permission.access} />
        </div>
      </div>
    </li>
  );
}
