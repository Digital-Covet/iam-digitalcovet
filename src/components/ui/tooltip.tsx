import { Tooltip } from "@ark-ui/solid/tooltip";
import type { JSX } from "solid-js";
import { Portal } from "solid-js/web";

interface AppTooltipProps {
  content: string;
  children: JSX.Element;
  disabled?: boolean;
}

export function AppTooltip(props: AppTooltipProps) {
  return (
    <Tooltip.Root positioning={{ placement: "top", gutter: 6 }} disabled={props.disabled}>
      <Tooltip.Trigger class="inline-flex items-center justify-center focus-visible:outline-2 focus-visible:outline-ring">
        {props.children}
      </Tooltip.Trigger>
      <Portal>
        <Tooltip.Positioner>
          <Tooltip.Content class="z-[70] max-w-60 rounded-md border border-border bg-surface-raised px-2 py-1 text-xs font-medium text-foreground shadow-xl">
            {props.content}
          </Tooltip.Content>
        </Tooltip.Positioner>
      </Portal>
    </Tooltip.Root>
  );
}
