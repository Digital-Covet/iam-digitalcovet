import { Tabs } from "@ark-ui/solid/tabs";
import Lock from "lucide-solid/icons/lock";
import { createSignal, For } from "solid-js";
import { PermissionSections } from "@/components/roles-access/permission-sections";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { countGrantedPermissions } from "@/lib/roles-matrix";
import type { RoleDefinition, RolesAccessData } from "@/types";

function RoleSummary(props: { role: RoleDefinition }) {
  const counts = () => countGrantedPermissions(props.role);

  return (
    <div class="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 class="font-heading text-lg font-bold leading-[1.3] tracking-[-0.01em] text-foreground">
          {props.role.name}
        </h2>
        <p class="mt-1 max-w-xl text-sm leading-[1.65] text-foreground-muted">
          {props.role.description}
        </p>
      </div>
      <dl class="flex shrink-0 gap-6 font-mono text-xs tabular-nums">
        <div>
          <dt class="text-[11px] font-medium uppercase tracking-[0.08em] text-foreground-muted">
            Members
          </dt>
          <dd class="mt-0.5 text-base text-foreground">
            {props.role.userCount}
          </dd>
        </div>
        <div>
          <dt class="text-[11px] font-medium uppercase tracking-[0.08em] text-foreground-muted">
            Granted
          </dt>
          <dd class="mt-0.5 text-base text-foreground">
            {counts().granted} / {counts().total}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export function RolesAccessView(props: { data: RolesAccessData }) {
  const [selected, setSelected] = createSignal(props.data.roles[0]?.id ?? "");

  return (
    <>
      <PageHeader
        title="Roles & Permission Sets"
        subtitle="Define ecosystem privilege boundaries and resource access limits"
      />
      <Tabs.Root
        value={selected()}
        onValueChange={(details) => setSelected(details.value)}
      >
        <Tabs.List class="mb-4 flex gap-1 border-b border-border">
          <For each={props.data.roles}>
            {(role) => (
              <Tabs.Trigger
                value={role.id}
                class="-mb-px inline-flex h-10 items-center gap-2 border-b-2 border-transparent px-3 text-sm font-medium text-foreground-muted transition-colors duration-[120ms] hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring data-[selected]:border-primary data-[selected]:text-foreground"
              >
                {role.id}
                <span class="rounded bg-surface-raised px-1.5 font-mono text-[11px] tabular-nums">
                  {role.userCount}
                </span>
              </Tabs.Trigger>
            )}
          </For>
        </Tabs.List>
        <For each={props.data.roles}>
          {(role) => (
            <Tabs.Content value={role.id}>
              <Card>
                <RoleSummary role={role} />
                <PermissionSections groups={role.groups} />
              </Card>
            </Tabs.Content>
          )}
        </For>
      </Tabs.Root>
      <p class="mt-4 flex items-center gap-2 font-mono text-xs text-foreground-muted">
        <Lock size={12} stroke-width={1.5} />
        Role permissions are defined in code and are read-only here.
      </p>
    </>
  );
}
