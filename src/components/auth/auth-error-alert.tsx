import TriangleAlert from "lucide-solid/icons/triangle-alert";
import { Show } from "solid-js";

export function AuthErrorAlert(props: { message: string | null }) {
  return (
    <Show when={props.message}>
      {(message) => (
        <div
          role="alert"
          class="flex items-start gap-2 rounded-md border border-critical-text/30 bg-critical-fill px-3 py-2.5 text-[13px] text-critical-text"
        >
          <TriangleAlert size={16} stroke-width={1.75} class="mt-px shrink-0" />
          <span>{message()}</span>
        </div>
      )}
    </Show>
  );
}
