import { createAsync } from "@solidjs/router";
import Check from "lucide-solid/icons/check";
import X from "lucide-solid/icons/x";
import { createMemo, For, Show } from "solid-js";
import { TONE_TEXT } from "@/components/ui/status-tone";
import { getPasswordPolicies } from "@/lib/password-policies";
import { validatePassword } from "@/lib/password-validation";

export function PasswordPolicyChecklist(props: { password: string }) {
  const policies = createAsync(() => getPasswordPolicies());
  const checks = createMemo(() => validatePassword(props.password, policies() ?? []).checks);

  return (
    <ul class="flex flex-wrap gap-2" aria-live="polite">
      <For each={checks()}>
        {(check) => (
          <li
            class={`inline-flex items-center gap-1.5 rounded px-2 py-1 font-mono text-xs ${
              check.passed ? TONE_TEXT.success : TONE_TEXT.neutral
            }`}
          >
            <Show when={check.passed} fallback={<X size={12} stroke-width={1.75} />}>
              <Check size={12} stroke-width={1.75} />
            </Show>
            {check.label}
            <span class="sr-only">{check.passed ? "passed" : "not met"}</span>
          </li>
        )}
      </For>
    </ul>
  );
}
