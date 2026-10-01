import { Accordion } from "@ark-ui/solid/accordion";
import ChevronDown from "lucide-solid/icons/chevron-down";
import { For } from "solid-js";
import { describeScope, type ScopeCategory } from "@/lib/oauth-scopes";

const CATEGORY_CLASS: Record<ScopeCategory, string> = {
  Read: "border-border text-foreground-muted",
  Write: "border-amber-500/40 text-amber-500",
};

function ScopeItem(props: { scope: string }) {
  const definition = () => describeScope(props.scope);

  return (
    <Accordion.Item
      value={props.scope}
      class="border-b border-border last:border-b-0"
    >
      <Accordion.ItemTrigger class="flex w-full items-center gap-3 py-3 text-left focus-visible:outline-2 focus-visible:outline-ring">
        <span class="min-w-0 flex-1">
          <span class="block text-[13.5px] font-medium">
            {definition().label}
          </span>
          <span class="block text-xs text-foreground-muted">
            {definition().summary}
          </span>
        </span>
        <span
          class={`rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] ${CATEGORY_CLASS[definition().category]}`}
        >
          {definition().mandatory ? "Required" : definition().category}
        </span>
        <Accordion.ItemIndicator class="text-foreground-muted transition-transform duration-[120ms] data-[state=open]:rotate-180">
          <ChevronDown size={14} stroke-width={1.75} />
        </Accordion.ItemIndicator>
      </Accordion.ItemTrigger>
      <Accordion.ItemContent class="pb-3 text-xs leading-[1.65] text-foreground-muted">
        <p>{definition().risk}</p>
        <code class="mt-2 inline-block rounded bg-surface-raised px-1.5 py-0.5 font-mono text-[11px]">
          {props.scope}
        </code>
      </Accordion.ItemContent>
    </Accordion.Item>
  );
}

export function ScopeList(props: { scopes: string[] }) {
  return (
    <Accordion.Root multiple collapsible class="border-y border-border">
      <For each={props.scopes}>{(scope) => <ScopeItem scope={scope} />}</For>
    </Accordion.Root>
  );
}
