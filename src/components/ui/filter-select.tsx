import { createListCollection, Select } from "@ark-ui/solid/select";
import Check from "lucide-solid/icons/check";
import ChevronDown from "lucide-solid/icons/chevron-down";
import { createMemo, For } from "solid-js";
import { Portal } from "solid-js/web";

export const FILTER_CONTROL =
  "h-9 w-full rounded-md border border-border bg-surface px-3 text-[13.5px] text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export interface SelectOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  label: string;
  value: string;
  options: readonly SelectOption[];
  disabled?: boolean;
  onChange: (value: string) => void;
}

export function FilterSelect(props: FilterSelectProps) {
  const collection = createMemo(() =>
    createListCollection<SelectOption>({
      items: [...props.options],
      itemToString: (item) => item.label,
      itemToValue: (item) => item.value,
    }),
  );

  return (
    <Select.Root
      collection={collection()}
      value={props.value ? [props.value] : []}
      disabled={props.disabled}
      positioning={{ placement: "bottom-start", gutter: 4, sameWidth: true }}
      onValueChange={(details) => {
        const next = details.value[0];
        if (next !== undefined && next !== props.value) props.onChange(next);
      }}
    >
      <Select.Label class="sr-only">{props.label}</Select.Label>
      <Select.Control>
        <Select.Trigger
          aria-label={props.label}
          class={`${FILTER_CONTROL} flex cursor-pointer items-center justify-between gap-2 text-left data-[disabled]:opacity-60`}
        >
          <Select.ValueText
            placeholder={`Select ${props.label.toLowerCase()}`}
            class="truncate"
          />
          <Select.Indicator class="shrink-0 text-foreground-muted">
            <ChevronDown size={14} stroke-width={1.75} />
          </Select.Indicator>
        </Select.Trigger>
      </Select.Control>
      <Portal>
        <Select.Positioner>
          <Select.Content class="z-50 max-h-64 min-w-(--reference-width) overflow-y-auto rounded-lg border border-border bg-surface-raised p-1 shadow-xl focus:outline-none">
            <For each={collection().items}>
              {(option) => (
                <Select.Item
                  item={option}
                  class="flex h-8 cursor-pointer items-center justify-between gap-2 rounded px-2 text-[13px] text-foreground data-[highlighted]:bg-primary/10 data-[state=checked]:font-medium"
                >
                  <Select.ItemText class="truncate">
                    {option.label}
                  </Select.ItemText>
                  <Select.ItemIndicator class="shrink-0 text-primary">
                    <Check size={14} stroke-width={1.75} />
                  </Select.ItemIndicator>
                </Select.Item>
              )}
            </For>
          </Select.Content>
        </Select.Positioner>
      </Portal>
      <Select.HiddenSelect aria-label={props.label} />
    </Select.Root>
  );
}
