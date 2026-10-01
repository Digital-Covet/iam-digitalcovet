import LoaderCircle from "lucide-solid/icons/loader-circle";
import { createSignal, Show } from "solid-js";
import { messageOf } from "@/components/account-settings/action-error";
import { AuthErrorAlert } from "@/components/auth/auth-error-alert";
import { Modal } from "@/components/ui/modal";
import { BUTTON_OUTLINE, BUTTON_PRIMARY } from "@/components/ui/page-header";
import { PasswordField } from "@/components/ui/password-field";

interface PasswordConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: (password: string) => Promise<void>;
  onOpenChange: (open: boolean) => void;
}

function ConfirmForm(props: Omit<PasswordConfirmDialogProps, "open" | "title" | "description">) {
  const [password, setPassword] = createSignal("");
  const [error, setError] = createSignal<string | null>(null);
  const [pending, setPending] = createSignal(false);

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    if (pending() || !password()) return;
    setError(null);
    setPending(true);
    try {
      await props.onConfirm(password());
    } catch (failure) {
      setError(messageOf(failure, "Something went wrong. Try again."));
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} class="space-y-4" novalidate>
      <AuthErrorAlert message={error()} />
      <PasswordField id="confirm-action-password" label="Current Password" autocomplete="current-password" autofocus value={password()} onInput={setPassword} />
      <div class="flex justify-end gap-2">
        <button type="button" onClick={() => props.onOpenChange(false)} class={BUTTON_OUTLINE}>
          Cancel
        </button>
        <button type="submit" disabled={pending() || !password()} class={`${BUTTON_PRIMARY} disabled:cursor-not-allowed disabled:opacity-60`}>
          <Show when={pending()}>
            <LoaderCircle size={16} stroke-width={1.75} class="animate-spin" />
          </Show>
          {props.confirmLabel}
        </button>
      </div>
    </form>
  );
}

export function PasswordConfirmDialog(props: PasswordConfirmDialogProps) {
  return (
    <Modal open={props.open} title={props.title} description={props.description} onOpenChange={props.onOpenChange}>
      <ConfirmForm
        confirmLabel={props.confirmLabel}
        onConfirm={props.onConfirm}
        onOpenChange={props.onOpenChange}
      />
    </Modal>
  );
}
