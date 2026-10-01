import { Clipboard } from "@ark-ui/solid/clipboard";
import Check from "lucide-solid/icons/check";
import Copy from "lucide-solid/icons/copy";

export function CopyBadge(props: { value: string; label: string }) {
  return (
    <Clipboard.Root value={props.value} timeout={1500}>
      <Clipboard.Trigger
        aria-label={`Copy ${props.label}`}
        class="group inline-flex max-w-full items-center gap-1.5 rounded bg-surface-raised px-1.5 py-0.5 font-mono text-xs text-foreground transition-colors duration-[120ms] hover:bg-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <Clipboard.ValueText class="truncate">
          {props.value}
        </Clipboard.ValueText>
        <Clipboard.Indicator
          copied={
            <Check
              size={12}
              stroke-width={1.5}
              class="shrink-0 text-emerald-700 dark:text-emerald-400"
            />
          }
        >
          <Copy
            size={12}
            stroke-width={1.5}
            class="shrink-0 text-foreground-muted"
          />
        </Clipboard.Indicator>
      </Clipboard.Trigger>
    </Clipboard.Root>
  );
}
