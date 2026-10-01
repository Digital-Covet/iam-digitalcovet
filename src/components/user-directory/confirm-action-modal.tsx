import LoaderCircle from "lucide-solid/icons/loader-circle";
import { createSignal, Show } from "solid-js";
import { Modal } from "@/components/ui/modal";
import { BUTTON_OUTLINE, BUTTON_PRIMARY } from "@/components/ui/page-header";
import {
  CONFIRMATIONS,
  type ConfirmedAction,
} from "@/components/user-directory/user-actions";
import type { DirectoryUser } from "@/types";

export interface PendingConfirmation {
  action: ConfirmedAction;
  user: DirectoryUser;
}

interface ConfirmActionModalProps {
  pending: PendingConfirmation | null;
  onCancel: () => void;
  onConfirm: (pending: PendingConfirmation) => Promise<void>;
}

export function ConfirmActionModal(props: ConfirmActionModalProps) {
  const [working, setWorking] = createSignal(false);
  const config = () =>
    props.pending ? CONFIRMATIONS[props.pending.action] : null;

  async function confirm() {
    if (!props.pending) return;
    setWorking(true);
    try {
      await props.onConfirm(props.pending);
    } finally {
      setWorking(false);
    }
  }

  return (
    <Modal
      open={props.pending !== null}
      title={config()?.title ?? ""}
      description={
        props.pending ? config()?.describe(props.pending.user) : undefined
      }
      onOpenChange={(open) => !open && !working() && props.onCancel()}
    >
      <div class="flex justify-end gap-2">
        <button
          type="button"
          class={BUTTON_OUTLINE}
          disabled={working()}
          onClick={props.onCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={working()}
          onClick={confirm}
          class={`${BUTTON_PRIMARY} disabled:opacity-60`}
        >
          <Show when={working()}>
            <LoaderCircle size={16} stroke-width={1.75} class="animate-spin" />
          </Show>
          {config()?.confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
