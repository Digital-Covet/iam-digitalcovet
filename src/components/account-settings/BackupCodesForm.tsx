import type { Component } from "solid-js";
import { Show, createSignal } from "solid-js";
import { authToaster } from "@/components/auth/auth-toaster";
import { authClient } from "@/lib/auth-client";
import { revealBackupCodes } from "@/lib/account-settings";
import { createAccountAction, unwrapAuthResult } from "./account-action";
import BackupCodeList from "./BackupCodeList";
import ConfirmPasswordForm from "./ConfirmPasswordForm";
import FormError from "./FormError";
import { secondaryButtonClass } from "./styles";

interface RevealedCodes {
  password: string;
  codes: string[];
}

const BackupCodesForm: Component<{ onRegenerated: () => void }> = (props) => {
  const [revealed, setRevealed] = createSignal<RevealedCodes | null>(null);
  const { pending, error, run } = createAccountAction();

  const reveal = async (password: string) => {
    setRevealed({ password, codes: await revealBackupCodes(password) });
  };

  const regenerate = async (current: RevealedCodes) => {
    const regenerated = await run(async () => {
      const { backupCodes } = await unwrapAuthResult(
        authClient.twoFactor.generateBackupCodes({ password: current.password }),
      );
      setRevealed({ ...current, codes: backupCodes });
    });
    if (regenerated) {
      authToaster.create({ title: "New backup codes generated.", type: "success" });
      props.onRegenerated();
    }
  };

  return (
    <Show
      when={revealed()}
      fallback={
        <>
          <p class="mb-4 text-sm text-muted-foreground">
            Confirm your password to view your backup codes.
          </p>
          <ConfirmPasswordForm submitLabel="Show codes" onConfirm={reveal} />
        </>
      }
    >
      {(current) => (
        <div class="space-y-4">
          <BackupCodeList codes={current().codes} />
          <div class="border-t border-border pt-4">
            <p class="mb-3 text-xs text-muted-foreground">
              Generating new codes replaces all of the codes above.
            </p>
            <FormError message={error()} />
            <button
              type="button"
              disabled={pending()}
              onClick={() => regenerate(current())}
              class={`${secondaryButtonClass} mt-3 w-full`}
            >
              {pending() ? "Generating..." : "Generate new codes"}
            </button>
          </div>
        </div>
      )}
    </Show>
  );
};

export default BackupCodesForm;
