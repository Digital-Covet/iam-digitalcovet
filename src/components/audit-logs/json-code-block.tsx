import { Clipboard } from "@ark-ui/solid/clipboard";
import Check from "lucide-solid/icons/check";
import Copy from "lucide-solid/icons/copy";
import { For } from "solid-js";

const TOKEN_PATTERN =
  /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?)/g;

interface JsonToken {
  text: string;
  class: string;
}

const KEY_CLASS = "text-blue-800 dark:text-blue-400";
const STRING_CLASS = "text-emerald-800 dark:text-emerald-400";
const LITERAL_CLASS = "text-amber-800 dark:text-amber-400";

function tokenize(json: string): JsonToken[] {
  const tokens: JsonToken[] = [];
  let cursor = 0;

  for (const match of json.matchAll(TOKEN_PATTERN)) {
    const [text, quoted, colon] = match;
    if (match.index > cursor)
      tokens.push({ text: json.slice(cursor, match.index), class: "" });

    if (quoted && colon) {
      tokens.push(
        { text: quoted, class: KEY_CLASS },
        { text: colon, class: "" },
      );
    } else {
      tokens.push({ text, class: quoted ? STRING_CLASS : LITERAL_CLASS });
    }
    cursor = match.index + text.length;
  }

  if (cursor < json.length)
    tokens.push({ text: json.slice(cursor), class: "" });
  return tokens;
}

export function JsonCodeBlock(props: { json: string }) {
  return (
    <Clipboard.Root value={props.json} timeout={1500}>
      <div class="overflow-hidden rounded-lg border border-border bg-surface">
        <div class="flex items-center justify-between border-b border-border px-3 py-2">
          <Clipboard.Label class="text-[11px] font-medium uppercase tracking-[0.08em] text-foreground-muted">
            Payload
          </Clipboard.Label>
          <Clipboard.Trigger class="inline-flex h-7 items-center gap-1.5 rounded px-2 text-xs font-medium text-foreground-muted transition-colors duration-[120ms] hover:bg-surface-raised hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring">
            <Clipboard.Indicator
              copied={<Check size={12} stroke-width={1.75} />}
            >
              <Copy size={12} stroke-width={1.75} />
            </Clipboard.Indicator>
            <Clipboard.Indicator copied="Copied">
              <span aria-live="polite">Copy</span>
            </Clipboard.Indicator>
          </Clipboard.Trigger>
        </div>
        <pre class="overflow-x-auto p-3 font-mono text-xs leading-[1.5] text-foreground">
          <code>
            <For each={tokenize(props.json)}>
              {(token) => <span class={token.class}>{token.text}</span>}
            </For>
          </code>
        </pre>
      </div>
    </Clipboard.Root>
  );
}
