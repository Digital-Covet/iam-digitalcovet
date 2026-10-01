import { NumberInput } from "@ark-ui/solid/number-input";
import { Slider } from "@ark-ui/solid/slider";
import { Switch } from "@ark-ui/solid/switch";
import Minus from "lucide-solid/icons/minus";
import Plus from "lucide-solid/icons/plus";
import type { JSX } from "solid-js";
import type {
  NumericDefinition,
  PolicyDefinition,
  PolicyValue,
  ToggleDefinition,
} from "@/lib/auth-policy-definitions";

interface FieldProps<D extends PolicyDefinition, V extends PolicyValue> {
  definition: D;
  value: V;
  onChange: (value: V) => void;
}

const FIELD_ROW = "flex items-start justify-between gap-4 py-3";
const STEPPER_BUTTON =
  "flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-foreground-muted transition-colors duration-[120ms] hover:bg-surface-raised hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-40";

function FieldCopy(props: { label: string; description: string }) {
  return (
    <div class="min-w-0">
      <p class="text-[13.5px] font-medium text-foreground">{props.label}</p>
      <p class="mt-0.5 text-xs text-foreground-muted">{props.description}</p>
    </div>
  );
}

function ToggleField(props: FieldProps<ToggleDefinition, boolean>) {
  return (
    <Switch.Root
      class={FIELD_ROW}
      checked={props.value}
      onCheckedChange={(details) => props.onChange(details.checked)}
    >
      <Switch.Label class="cursor-pointer">
        <FieldCopy label={props.definition.label} description={props.definition.description} />
      </Switch.Label>
      <Switch.Control class="relative mt-0.5 inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full bg-border transition-colors duration-[120ms] data-[state=checked]:bg-primary data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-ring">
        <Switch.Thumb class="block h-4 w-4 translate-x-0.5 rounded-full bg-white shadow-xs transition-transform duration-[120ms] data-[state=checked]:translate-x-[18px]" />
      </Switch.Control>
      <Switch.HiddenInput />
    </Switch.Root>
  );
}

function RangeField(props: FieldProps<NumericDefinition, number>) {
  return (
    <Slider.Root
      class="py-3"
      min={props.definition.min}
      max={props.definition.max}
      step={1}
      value={[props.value]}
      onValueChange={(details) => props.onChange(details.value[0])}
    >
      <div class="flex items-start justify-between gap-4">
        <Slider.Label>
          <FieldCopy label={props.definition.label} description={props.definition.description} />
        </Slider.Label>
        <span class="shrink-0 rounded bg-surface-raised px-2 py-0.5 font-mono text-xs tabular-nums text-foreground">
          {props.value} {props.definition.unit}
        </span>
      </div>
      <Slider.Control class="mt-3 flex h-5 items-center">
        <Slider.Track class="h-1.5 flex-1 rounded-full bg-border">
          <Slider.Range class="h-full rounded-full bg-primary" />
        </Slider.Track>
        <Slider.Thumb
          index={0}
          class="h-4 w-4 rounded-full border-2 border-primary bg-surface shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Slider.HiddenInput />
        </Slider.Thumb>
      </Slider.Control>
      <div class="mt-1 flex justify-between font-mono text-[11px] tabular-nums text-foreground-muted">
        <span>{props.definition.min}</span>
        <span>{props.definition.max}</span>
      </div>
    </Slider.Root>
  );
}

function NumberField(props: FieldProps<NumericDefinition, number>) {
  return (
    <NumberInput.Root
      class={FIELD_ROW}
      min={props.definition.min}
      max={props.definition.max}
      value={String(props.value)}
      onValueChange={(details) => {
        if (!Number.isNaN(details.valueAsNumber)) props.onChange(details.valueAsNumber);
      }}
    >
      <NumberInput.Label>
        <FieldCopy label={props.definition.label} description={props.definition.description} />
      </NumberInput.Label>
      <div class="flex shrink-0 items-center gap-2">
        <NumberInput.Control class="flex items-center gap-1">
          <NumberInput.DecrementTrigger class={STEPPER_BUTTON} aria-label={`Decrease ${props.definition.label}`}>
            <Minus size={14} stroke-width={1.75} />
          </NumberInput.DecrementTrigger>
          <NumberInput.Input class="h-8 w-16 rounded-md border border-border bg-surface px-2 text-center font-mono text-sm tabular-nums text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" />
          <NumberInput.IncrementTrigger class={STEPPER_BUTTON} aria-label={`Increase ${props.definition.label}`}>
            <Plus size={14} stroke-width={1.75} />
          </NumberInput.IncrementTrigger>
        </NumberInput.Control>
        <span class="w-16 text-xs text-foreground-muted">{props.definition.unit}</span>
      </div>
    </NumberInput.Root>
  );
}

export function PolicyField(props: FieldProps<PolicyDefinition, PolicyValue>): JSX.Element {
  const definition = props.definition;
  if (definition.control === "toggle") {
    return (
      <ToggleField
        definition={definition}
        value={props.value as boolean}
        onChange={props.onChange}
      />
    );
  }
  const Field = definition.control === "range" ? RangeField : NumberField;
  return <Field definition={definition} value={props.value as number} onChange={props.onChange} />;
}
