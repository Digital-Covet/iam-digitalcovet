import type { Component } from "solid-js";
import { For, Show } from "solid-js";
import { Check, X } from "lucide-solid";
import type { PasswordPolicy } from "@/types";
import { validatePassword, type PasswordCheck } from "@/lib/password-validation";

const PasswordRequirements: Component<{
  password: string;
  policies: PasswordPolicy[];
}> = (props) => {
  const result = () => validatePassword(props.password, props.policies);

  return (
    <Show when={props.password.length > 0}>
      <div class="rounded-md border border-border bg-muted/30 p-3">
        <p class="mb-2 text-xs font-medium text-muted-foreground">
          Password requirements:
        </p>
        <ul class="space-y-1.5">
          <For each={result().checks}>
            {(check: PasswordCheck) => (
              <li class="flex items-center gap-2 text-xs">
                <Show
                  when={check.passed}
                  fallback={
                    <span class="flex h-4 w-4 items-center justify-center rounded-full bg-muted">
                      <X size={10} class="text-muted-foreground" />
                    </span>
                  }
                >
                  <span class="flex h-4 w-4 items-center justify-center rounded-full bg-green-100">
                    <Check size={10} class="text-green-600" />
                  </span>
                </Show>
                <span
                  class={
                    check.passed
                      ? "text-green-600"
                      : "text-muted-foreground"
                  }
                >
                  {check.label}
                  {check.key === "min_length" && (
                    <span class="text-muted-foreground">
                      {" "}
                      ({check.passed ? "met" : "minimum required"})
                    </span>
                  )}
                </span>
              </li>
            )}
          </For>
        </ul>
      </div>
    </Show>
  );
};

export default PasswordRequirements;
