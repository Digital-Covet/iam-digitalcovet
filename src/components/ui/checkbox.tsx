import { Checkbox } from "@ark-ui/solid/checkbox";
import Check from "lucide-solid/icons/check";

interface ArkCheckboxProps {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

export function ArkCheckbox(props: ArkCheckboxProps) {
  return (
    <Checkbox.Root
      checked={props.checked}
      disabled={props.disabled}
      onCheckedChange={(details) => props.onChange(details.checked === true)}
      class="flex cursor-pointer items-center gap-2.5 text-[13px] data-[disabled]:cursor-not-allowed data-[disabled]:opacity-60"
    >
      <Checkbox.Control class="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-border bg-surface text-primary-fg transition-colors duration-[120ms] data-[state=checked]:border-primary data-[state=checked]:bg-primary data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-ring">
        <Checkbox.Indicator>
          <Check size={12} stroke-width={2.5} />
        </Checkbox.Indicator>
      </Checkbox.Control>
      <Checkbox.Label class="cursor-pointer text-foreground">
        {props.label}
      </Checkbox.Label>
      <Checkbox.HiddenInput />
    </Checkbox.Root>
  );
}
