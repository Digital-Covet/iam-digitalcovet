import { TONE_DOT, TONE_PILL } from "@/components/ui/status-tone";
import type { StatusTone } from "@/types";

export function StatusPill(props: { tone: StatusTone; label: string }) {
  return (
    <span
      class={`inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.08em] ${TONE_PILL[props.tone]}`}
    >
      <span class={`h-1.5 w-1.5 rounded-full ${TONE_DOT[props.tone]}`} />
      {props.label}
    </span>
  );
}
