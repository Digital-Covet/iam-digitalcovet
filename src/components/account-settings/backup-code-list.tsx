import { Clipboard } from "@ark-ui/solid/clipboard";
import Copy from "lucide-solid/icons/copy";
import Download from "lucide-solid/icons/download";
import { For } from "solid-js";
import { toaster } from "@/components/auth/auth-toaster";
import { BUTTON_OUTLINE } from "@/components/ui/page-header";

function download(codes: string[]) {
  const url = URL.createObjectURL(
    new Blob([`${codes.join("\n")}\n`], { type: "text/plain" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "digitalcovet-backup-codes.txt";
  link.click();
  URL.revokeObjectURL(url);
}

export function BackupCodeList(props: { codes: string[] }) {
  return (
    <Clipboard.Root
      value={props.codes.join("\n")}
      timeout={2000}
      onStatusChange={(details) => {
        if (details.copied)
          toaster.create({ title: "Backup codes copied", type: "success" });
      }}
    >
      <div class="space-y-3">
        <ul class="grid grid-cols-2 gap-2 rounded-md border border-border bg-surface p-3 font-mono text-[13px] tabular-nums">
          <For each={props.codes}>{(code) => <li>{code}</li>}</For>
        </ul>
        <div class="flex gap-2">
          <Clipboard.Trigger class={`${BUTTON_OUTLINE} flex-1`}>
            <Copy size={14} stroke-width={1.75} />
            <Clipboard.Indicator copied="Copied">Copy</Clipboard.Indicator>
          </Clipboard.Trigger>
          <button
            type="button"
            onClick={() => download(props.codes)}
            class={`${BUTTON_OUTLINE} flex-1`}
          >
            <Download size={14} stroke-width={1.75} />
            Download
          </button>
        </div>
      </div>
    </Clipboard.Root>
  );
}
