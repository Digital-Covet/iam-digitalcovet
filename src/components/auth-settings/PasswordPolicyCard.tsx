import { Switch } from "@ark-ui/solid/switch";
import type { Component } from "solid-js";
import { For } from "solid-js";
import type { PasswordPolicy } from "@/types";

const PasswordPolicyCard: Component<{
  policies: PasswordPolicy[];
  onToggle?: (id: string, enabled: boolean) => void;
}> = (props) => (
  <div class="overflow-hidden rounded-xl border border-border bg-card shadow-[0_4px_6px_-1px_rgb(0,0,0,0.05)]">
    {/* Header */}
    <div class="flex items-center justify-between border-b border-border p-4">
      <div>
        <h2 class="font-heading text-base font-semibold text-foreground">
          Password Policy
        </h2>
        <p class="mt-0.5 text-xs text-muted-foreground">
          Define complexity requirements and rotation rules.
        </p>
      </div>
    </div>

    {/* Policies List */}
    <div class="divide-y divide-border">
      <For each={props.policies}>
        {(policy) => (
          <div class="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-muted/30">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-foreground">
                  {policy.label}
                </span>
                <span class="inline-flex items-center rounded-md bg-accent px-1.5 py-0.5 text-[11px] font-medium text-accent-foreground">
                  {typeof policy.value === "boolean"
                    ? policy.value
                      ? "On"
                      : "Off"
                    : policy.value}
                </span>
              </div>
              <p class="mt-0.5 text-xs text-muted-foreground">
                {policy.description}
              </p>
            </div>
            <Switch.Root
              checked={policy.enabled}
              onCheckedChange={(d) =>
                props.onToggle?.(policy.id, d.checked)
              }
              class="flex cursor-pointer items-center"
            >
              <Switch.Control class="relative h-6 w-11 shrink-0 rounded-full bg-border data-[state=checked]:bg-primary">
                <Switch.Thumb class="block h-5 w-5 translate-x-0.5 translate-y-0.5 rounded-full bg-white shadow-[0_1px_2px_0_rgb(0,0,0,0.05)] data-[state=checked]:translate-x-5.5" />
              </Switch.Control>
              <Switch.HiddenInput />
            </Switch.Root>
          </div>
        )}
      </For>
    </div>
  </div>
);

export default PasswordPolicyCard;
