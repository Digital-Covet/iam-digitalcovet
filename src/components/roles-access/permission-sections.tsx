import { Accordion } from "@ark-ui/solid/accordion";
import ChevronDown from "lucide-solid/icons/chevron-down";
import { For } from "solid-js";
import { PermissionRow } from "@/components/roles-access/permission-row";
import type { PermissionGroup } from "@/types";

function grantedSummary(group: PermissionGroup): string {
  const granted = group.permissions.filter(
    (permission) => permission.access !== "denied",
  ).length;
  return `${granted} / ${group.permissions.length} allowed`;
}

export function PermissionSections(props: { groups: PermissionGroup[] }) {
  return (
    <Accordion.Root
      multiple
      collapsible
      defaultValue={props.groups.map((group) => group.id)}
      class="divide-y divide-border-subtle"
    >
      <For each={props.groups}>
        {(group) => (
          <Accordion.Item value={group.id}>
            <Accordion.ItemTrigger class="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors duration-[120ms] hover:bg-surface-raised focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring">
              <span class="font-heading text-[15px] font-semibold text-foreground">
                {group.title}
              </span>
              <span class="flex items-center gap-3">
                <span class="font-mono text-xs tabular-nums text-foreground-muted">
                  {grantedSummary(group)}
                </span>
                <Accordion.ItemIndicator class="text-foreground-muted transition-transform duration-200 data-[state=open]:rotate-180">
                  <ChevronDown size={16} />
                </Accordion.ItemIndicator>
              </span>
            </Accordion.ItemTrigger>
            <Accordion.ItemContent>
              <ul class="divide-y divide-border-subtle border-t border-border-subtle">
                <For each={group.permissions}>
                  {(permission) => <PermissionRow permission={permission} />}
                </For>
              </ul>
            </Accordion.ItemContent>
          </Accordion.Item>
        )}
      </For>
    </Accordion.Root>
  );
}
