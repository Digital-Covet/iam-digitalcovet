import { Dialog } from "@ark-ui/solid/dialog";
import { QrCode } from "@ark-ui/solid/qr-code";
import { Portal } from "solid-js/web";
import type { Component } from "solid-js";
import { For, Match, Show, Switch, createSignal } from "solid-js";
import { X } from "lucide-solid";
import { authClient } from "@/lib/auth-client";

interface TwoFactorSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reset: boolean;
  onTwoFactorChange: (enabled: boolean) => void;
}

interface TotpEnrollment {
  totpURI: string;
  backupCodes: string[];
}

type AuthResult<T> = { data: T | null; error: { message?: string } | null };

const unwrap = <T,>(result: AuthResult<T>, fallback: string): T => {
  if (result.error || !result.data) {
    throw new Error(result.error?.message ?? fallback);
  }
  return result.data;
};

const errorMessage = (err: unknown) =>
  err instanceof Error ? err.message : "Something went wrong. Please try again.";

const secretFromUri = (totpURI: string) =>
  new URL(totpURI).searchParams.get("secret") ?? "";

const inputClass =
  "w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-ring";

const primaryButtonClass =
  "w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50";

const TwoFactorSetupDialog: Component<TwoFactorSetupDialogProps> = (props) => {
  const [password, setPassword] = createSignal("");
  const [code, setCode] = createSignal("");
  const [enrollment, setEnrollment] = createSignal<TotpEnrollment | null>(null);
  const [error, setError] = createSignal<string | null>(null);
  const [busy, setBusy] = createSignal(false);

  const resetState = () => {
    setPassword("");
    setCode("");
    setEnrollment(null);
    setError(null);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) resetState();
    props.onOpenChange(open);
  };

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  // Better Auth refuses to enroll over a verified authenticator, so a reset
  // has to remove the old one first. The new one only becomes active once
  // its first code is verified.
  const startEnrollment = (e: SubmitEvent) => {
    e.preventDefault();
    void run(async () => {
      if (props.reset) {
        unwrap(
          await authClient.twoFactor.disable({ password: password() }),
          "Could not remove your current authenticator.",
        );
        props.onTwoFactorChange(false);
      }
      const result = unwrap(
        await authClient.twoFactor.enable({ password: password() }),
        "Could not start two-factor setup.",
      );
      if (result.method !== "totp") {
        throw new Error("Authenticator setup is not available.");
      }
      setEnrollment({ totpURI: result.totpURI, backupCodes: result.backupCodes });
      setPassword("");
    });
  };

  const confirmEnrollment = (e: SubmitEvent) => {
    e.preventDefault();
    void run(async () => {
      unwrap(
        await authClient.twoFactor.verifyTotp({ code: code() }),
        "Invalid code. Please try again.",
      );
      props.onTwoFactorChange(true);
      handleOpenChange(false);
    });
  };

  return (
    <Dialog.Root
      open={props.open}
      onOpenChange={(d) => handleOpenChange(d.open)}
      lazyMount
      unmountOnExit
    >
      <Portal>
        <Dialog.Backdrop class="fixed inset-0 z-80 bg-black/50" />
        <Dialog.Positioner class="fixed inset-0 z-80 flex items-center justify-center p-4">
          <Dialog.Content class="max-h-full w-full max-w-md overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-xl">
            <div class="flex items-start justify-between gap-4">
              <div>
                <Dialog.Title class="text-lg font-semibold text-foreground">
                  {props.reset ? "Reset Two-Factor Authentication" : "Enable Two-Factor Authentication"}
                </Dialog.Title>
                <Dialog.Description class="mt-1 text-sm text-muted-foreground">
                  {enrollment()
                    ? "Scan the QR code with your authenticator app, then enter the 6-digit code it shows."
                    : props.reset
                      ? "Your current authenticator and backup codes will stop working. Confirm your password to continue."
                      : "Confirm your password to set up an authenticator app."}
                </Dialog.Description>
              </div>
              <Dialog.CloseTrigger
                aria-label="Close"
                class="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <X size={18} aria-hidden="true" />
              </Dialog.CloseTrigger>
            </div>

            <Switch>
              <Match when={!enrollment()}>
                <form onSubmit={startEnrollment} class="mt-6 space-y-4">
                  <label class="block space-y-1.5">
                    <span class="text-sm font-medium text-foreground">Password</span>
                    <input
                      type="password"
                      autocomplete="current-password"
                      required
                      value={password()}
                      onInput={(e) => setPassword(e.currentTarget.value)}
                      class={inputClass}
                    />
                  </label>
                  <button type="submit" disabled={busy() || !password()} class={primaryButtonClass}>
                    {busy() ? "Please wait..." : "Continue"}
                  </button>
                </form>
              </Match>
              <Match when={enrollment()}>
                {(current) => (
                  <form onSubmit={confirmEnrollment} class="mt-6 space-y-5">
                    <div class="flex flex-col items-center gap-3">
                      <QrCode.Root value={current().totpURI} class="rounded-lg bg-white p-3">
                        <QrCode.Frame class="h-44 w-44">
                          <QrCode.Pattern />
                        </QrCode.Frame>
                      </QrCode.Root>
                      <p class="text-center text-xs text-muted-foreground">
                        Can't scan? Enter this key manually:
                        <code class="mt-1 block break-all font-mono text-foreground">
                          {secretFromUri(current().totpURI)}
                        </code>
                      </p>
                    </div>

                    <div class="rounded-lg border border-border bg-background p-4">
                      <p class="text-sm font-medium text-foreground">Backup codes</p>
                      <p class="mt-1 text-xs text-muted-foreground">
                        Save these somewhere safe. Each code can be used once if you lose your device.
                      </p>
                      <ul class="mt-3 grid grid-cols-2 gap-2 font-mono text-sm text-foreground">
                        <For each={current().backupCodes}>{(backupCode) => <li>{backupCode}</li>}</For>
                      </ul>
                    </div>

                    <label class="block space-y-1.5">
                      <span class="text-sm font-medium text-foreground">Authenticator code</span>
                      <input
                        type="text"
                        inputmode="numeric"
                        autocomplete="one-time-code"
                        pattern="\d{6}"
                        maxlength={6}
                        required
                        value={code()}
                        onInput={(e) => setCode(e.currentTarget.value.replace(/\D/g, ""))}
                        class={`${inputClass} text-center font-mono tracking-widest`}
                      />
                    </label>
                    <button type="submit" disabled={busy() || code().length !== 6} class={primaryButtonClass}>
                      {busy() ? "Verifying..." : "Verify and enable"}
                    </button>
                  </form>
                )}
              </Match>
            </Switch>

            <Show when={error()}>
              <p role="alert" class="mt-4 rounded-md border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                {error()}
              </p>
            </Show>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default TwoFactorSetupDialog;
