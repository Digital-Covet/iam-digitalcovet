import { Clipboard } from "@ark-ui/solid/clipboard";
import type { Component } from "solid-js";
import { For } from "solid-js";
import { Check, Copy } from "lucide-solid";
import { secondaryButtonClass } from "./styles";

const BackupCodeList: Component<{ codes: string[] }> = (props) => (
  <div class="space-y-3">
    <ul class="grid grid-cols-2 gap-2 rounded-lg border border-border bg-muted p-4 font-mono text-sm text-foreground">
      <For each={props.codes}>{(code) => <li>{code}</li>}</For>
    </ul>
    <p class="text-xs text-muted-foreground">
      Each code works once. Keep them somewhere safe, like a password manager.
    </p>
    <Clipboard.Root value={props.codes.join("\n")}>
      <Clipboard.Trigger class={`${secondaryButtonClass} inline-flex w-full items-center justify-center gap-2`}>
        <Clipboard.Indicator
          copied={
            <>
              <Check size={14} aria-hidden="true" /> Copied
            </>
          }
        >
          <Copy size={14} aria-hidden="true" /> Copy codes
        </Clipboard.Indicator>
      </Clipboard.Trigger>
    </Clipboard.Root>
  </div>
);

export default BackupCodeList;
