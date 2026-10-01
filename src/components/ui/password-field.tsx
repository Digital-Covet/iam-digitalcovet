import { Field } from "@ark-ui/solid/field";
import { PasswordInput } from "@ark-ui/solid/password-input";
import Eye from "lucide-solid/icons/eye";
import EyeOff from "lucide-solid/icons/eye-off";
import type { JSX } from "solid-js";
import { Show } from "solid-js";

export const FIELD_CLASS =
  "h-10 w-full rounded-md border border-border bg-surface-raised px-3 text-sm text-foreground " +
  "placeholder:text-foreground-muted transition-colors duration-[120ms] " +
  "focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-60";

export const LABEL_CLASS =
  "text-[11px] font-medium uppercase tracking-[0.08em] text-foreground-muted";

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  autocomplete: "current-password" | "new-password";
  autofocus?: boolean;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  error?: string | null;
  placeholder?: string;
  labelAside?: JSX.Element;
  onInput: (value: string) => void;
}

export function PasswordField(props: PasswordFieldProps) {
  return (
    <Field.Root
      invalid={props.invalid ?? props.error != null}
      disabled={props.disabled}
      required={props.required}
    >
      <PasswordInput.Root
        autoComplete={props.autocomplete}
        disabled={props.disabled}
        invalid={props.invalid ?? props.error != null}
      >
        <div class="flex items-center justify-between">
          <PasswordInput.Label for={props.id} class={LABEL_CLASS}>
            {props.label}
          </PasswordInput.Label>
          <Show when={props.labelAside}>
            {(aside) => <span>{aside()}</span>}
          </Show>
        </div>
        <PasswordInput.Control class="relative mt-1.5">
          <PasswordInput.Input
            id={props.id}
            name={props.id}
            autofocus={props.autofocus}
            placeholder={props.placeholder}
            value={props.value}
            onInput={(event) => props.onInput(event.currentTarget.value)}
            class={`${FIELD_CLASS} data-[invalid]:border-critical-text pr-10`}
          />
          <PasswordInput.VisibilityTrigger
            aria-label="Toggle password visibility"
            class="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-foreground-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            <PasswordInput.Indicator
              fallback={<Eye size={16} stroke-width={1.75} />}
            >
              <EyeOff size={16} stroke-width={1.75} />
            </PasswordInput.Indicator>
          </PasswordInput.VisibilityTrigger>
        </PasswordInput.Control>
      </PasswordInput.Root>
      <Show when={props.error}>
        {(message) => (
          <Field.ErrorText class="mt-1 text-xs text-red-800 dark:text-red-400">
            {message()}
          </Field.ErrorText>
        )}
      </Show>
    </Field.Root>
  );
}
