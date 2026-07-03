import { Checkbox } from "@ark-ui/solid/checkbox";
import { Check } from "lucide-solid";
import type { Component } from "solid-js";

interface PermissionCheckboxProps {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

const PermissionCheckbox: Component<PermissionCheckboxProps> = (props) => (
  <Checkbox.Root
    checked={props.checked}
    disabled={props.disabled}
    onCheckedChange={(d) => props.onChange(d.checked === true)}
    class="flex items-center gap-2"
    classList={{ "cursor-pointer": !props.disabled, "cursor-not-allowed opacity-60": props.disabled }}
  >
    <Checkbox.Control class="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border border-border bg-card transition-colors data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[disabled]:opacity-50 data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-ring">
      <Checkbox.Indicator>
        <Check size={13} class="text-primary-foreground" aria-hidden="true" />
      </Checkbox.Indicator>
    </Checkbox.Control>
    <Checkbox.Label class="text-sm text-foreground">{props.label}</Checkbox.Label>
    <Checkbox.HiddenInput />
  </Checkbox.Root>
);

export default PermissionCheckbox;
