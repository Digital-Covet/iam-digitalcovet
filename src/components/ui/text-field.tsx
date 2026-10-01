import { Field } from "@ark-ui/solid/field";
import type { JSX } from "solid-js";
import { Show } from "solid-js";

export const TEXT_FIELD_INPUT =
  "h-10 w-full rounded-md border border-border bg-surface-raised px-3 text-sm text-foreground " +
  "placeholder:text-foreground-muted transition-colors duration-[120ms] " +
  "focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-60 " +
  "data-[invalid]:border-critical-text";

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  type?: string;
  name?: string;
  placeholder?: string;
  autocomplete?: string;
  autocapitalize?: "off" | "none" | "sentences" | "words" | "characters";
  spellcheck?: boolean;
  maxLength?: number;
  autofocus?: boolean;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  error?: string | null;
  helper?: string;
  mono?: boolean;
  srOnlyLabel?: boolean;
  inputClass?: string;
  leadingIcon?: JSX.Element;
  onInput: (value: string) => void;
}

export function TextField(props: TextFieldProps) {
  return (
    <Field.Root invalid={props.invalid ?? props.error != null} disabled={props.disabled} required={props.required}>
      <Field.Label
        for={props.id}
        class={
          props.srOnlyLabel
            ? "sr-only"
            : "text-[11px] font-medium uppercase tracking-[0.08em] text-foreground-muted"
        }
      >
        {props.label}
      </Field.Label>
      <div class={`relative ${props.srOnlyLabel ? "" : "mt-1.5"}`}>
        <Show when={props.leadingIcon}>
          <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted">
            {props.leadingIcon}
          </span>
        </Show>
        <Field.Input
          id={props.id}
          name={props.name ?? props.id}
          type={props.type ?? "text"}
          autocomplete={props.autocomplete}
          autocapitalize={props.autocapitalize}
          spellcheck={props.spellcheck}
          maxLength={props.maxLength}
          autofocus={props.autofocus}
          placeholder={props.placeholder}
          value={props.value}
          onInput={(event) => props.onInput(event.currentTarget.value)}
          class={`${props.inputClass ?? TEXT_FIELD_INPUT} ${props.leadingIcon ? "pl-8" : ""} ${props.mono ? "font-mono" : ""}`}
        />
      </div>
      <Show when={props.helper}>
        <Field.HelperText class="mt-1 text-xs text-foreground-muted">{props.helper}</Field.HelperText>
      </Show>
      <Show when={props.error}>
        {(message) => (
          <Field.ErrorText class="mt-1 text-xs text-red-800 dark:text-red-400">{message()}</Field.ErrorText>
        )}
      </Show>
    </Field.Root>
  );
}
