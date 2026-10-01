import Check from "lucide-solid/icons/check";
import X from "lucide-solid/icons/x";
import { createMemo, createSignal, For, Show } from "solid-js";
import { TONE_TEXT } from "@/components/ui/status-tone";
import { TextField } from "@/components/ui/text-field";
import {
  type PolicyValues,
  toPasswordPolicies,
} from "@/lib/auth-policy-definitions";
import { validatePassword } from "@/lib/password-validation";

const RULE_LABELS: Record<string, (policies: PolicyValues) => string> = {
  min_length: (policies) => `${policies.min_length}+ characters`,
  require_uppercase: () => "Uppercase letter",
  require_lowercase: () => "Lowercase letter",
  require_numbers: () => "Number",
  require_special: () => "Symbol",
};

export function PolicyTester(props: { policies: PolicyValues }) {
  const [candidate, setCandidate] = createSignal("");
  const checks = createMemo(
    () =>
      validatePassword(candidate(), toPasswordPolicies(props.policies)).checks,
  );

  return (
    <div class="rounded-md border border-border bg-surface-raised p-4">
      <h4 class="font-heading text-[15px] font-semibold text-foreground">
        Interactive Rule Tester
      </h4>
      <div class="mt-3">
        <TextField
          id="policy-tester-input"
          label="Test Password Candidate"
          autocomplete="off"
          spellcheck={false}
          mono
          placeholder="Type a password to test"
          value={candidate()}
          onInput={setCandidate}
        />
      </div>
      <ul class="mt-3 flex flex-wrap gap-2" aria-live="polite">
        <For each={checks()}>
          {(check) => (
            <li
              class={`inline-flex items-center gap-1.5 rounded px-2 py-1 font-mono text-xs ${
                check.passed ? TONE_TEXT.success : TONE_TEXT.critical
              }`}
            >
              <Show
                when={check.passed}
                fallback={<X size={12} stroke-width={1.75} />}
              >
                <Check size={12} stroke-width={1.75} />
              </Show>
              {RULE_LABELS[check.key](props.policies)}
              <span class="sr-only">{check.passed ? "passed" : "not met"}</span>
            </li>
          )}
        </For>
      </ul>
    </div>
  );
}
