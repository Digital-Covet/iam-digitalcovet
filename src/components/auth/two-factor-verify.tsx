import { PinInput } from "@ark-ui/solid/pin-input";
import KeyRound from "lucide-solid/icons/key-round";
import LoaderCircle from "lucide-solid/icons/loader-circle";
import Smartphone from "lucide-solid/icons/smartphone";
import { createSignal, Index, Match, Show, Switch } from "solid-js";
import { AuthErrorAlert } from "@/components/auth/auth-error-alert";
import { TextField } from "@/components/ui/text-field";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/lib/constants";
import { resolvePostAuthDestination } from "@/lib/oauth-flow";

const CODE_LENGTH = 6;
const PIN_CELLS = Array.from({ length: CODE_LENGTH }, (_, index) => index);
const GENERIC_FAILURE = "Unable to verify the code. Try again.";

const LABEL_CLASS =
  "text-[11px] font-medium uppercase tracking-[0.08em] text-foreground-muted";
const LINK_BUTTON_CLASS =
  "text-xs text-[#f87171] underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-ring";
const PIN_CELL_CLASS =
  "h-12 w-full min-w-0 rounded-md border border-border bg-surface-raised text-center font-mono text-lg text-foreground " +
  "tabular-nums transition-[transform,border-color] duration-[80ms] " +
  "focus:scale-105 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40 " +
  "data-[invalid]:border-critical-text disabled:opacity-60";

type VerifyMode = "totp" | "backup";

export function TwoFactorVerify(props: { redirectTo: string | null }) {
  const [mode, setMode] = createSignal<VerifyMode>("totp");
  const [pin, setPin] = createSignal<string[]>([]);
  const [backupCode, setBackupCode] = createSignal("");
  const [error, setError] = createSignal<string | null>(null);
  const [pending, setPending] = createSignal(false);
  let pinContainer: HTMLDivElement | undefined;

  const totpCode = () => pin().join("");
  const canSubmit = () =>
    !pending() &&
    (mode() === "totp"
      ? totpCode().length === CODE_LENGTH
      : backupCode().trim().length > 0);

  function switchMode(next: VerifyMode) {
    setError(null);
    setMode(next);
  }

  function resetPin() {
    setPin([]);
    pinContainer?.querySelector("input")?.focus();
  }

  function continueAfterVerification() {
    // Sign-in in a downstream-app flow must resume the interrupted authorization request.
    window.location.assign(
      resolvePostAuthDestination(window.location.search, props.redirectTo),
    );
  }

  async function verify(code: string) {
    if (pending()) return;
    setError(null);
    setPending(true);

    try {
      const { data, error: failure } =
        mode() === "totp"
          ? await authClient.twoFactor.verifyTotp({ code })
          : await authClient.twoFactor.verifyBackupCode({ code });

      if (failure) {
        setError(failure.message || GENERIC_FAILURE);
        if (mode() === "totp") resetPin();
        return;
      }
      const handledByPlugin = data && "redirect" in data && data.redirect;
      if (!handledByPlugin) continueAfterVerification();
    } catch {
      setError(GENERIC_FAILURE);
    } finally {
      setPending(false);
    }
  }

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (!canSubmit()) return;
    void verify(mode() === "totp" ? totpCode() : backupCode().trim());
  }

  return (
    <form onSubmit={handleSubmit} class="space-y-5" novalidate>
      <div class="space-y-1">
        <h2 class="font-heading text-lg font-bold tracking-[-0.01em]">
          Two-Factor Authentication
        </h2>
        <p class="text-[13px] text-foreground-muted">
          <Show
            when={mode() === "totp"}
            fallback="Enter one of your single-use backup codes"
          >
            Enter the 6-digit code from your authenticator app
          </Show>
        </p>
      </div>

      <AuthErrorAlert message={error()} />

      <Switch>
        <Match when={mode() === "totp"}>
          <PinInput.Root
            count={CODE_LENGTH}
            type="numeric"
            otp
            autoFocus
            value={pin()}
            invalid={error() !== null}
            disabled={pending()}
            onValueChange={(details) => setPin(details.value)}
            onValueComplete={(details) => void verify(details.valueAsString)}
          >
            <PinInput.Label class={LABEL_CLASS}>
              Authentication Code
            </PinInput.Label>
            <PinInput.Control
              ref={pinContainer}
              class="mt-1.5 grid grid-cols-6 gap-2"
            >
              <Index each={PIN_CELLS}>
                {(cell) => (
                  <PinInput.Input index={cell()} class={PIN_CELL_CLASS} />
                )}
              </Index>
            </PinInput.Control>
            <PinInput.HiddenInput />
          </PinInput.Root>
        </Match>
        <Match when={mode() === "backup"}>
          <TextField
            id="backup-code"
            label="Backup Code"
            autocomplete="one-time-code"
            autocapitalize="off"
            spellcheck={false}
            autofocus
            mono
            placeholder="xxxxx-xxxxx"
            value={backupCode()}
            invalid={error() !== null}
            error={error()}
            onInput={setBackupCode}
          />
        </Match>
      </Switch>

      <button
        type="submit"
        disabled={!canSubmit()}
        class="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-fg transition-colors duration-[120ms] hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Show when={pending()}>
          <LoaderCircle size={16} stroke-width={1.75} class="animate-spin" />
        </Show>
        {pending() ? "Verifying…" : "Verify & Continue"}
      </button>

      <div class="flex flex-col items-center gap-3 border-t border-border pt-4">
        <Show
          when={mode() === "totp"}
          fallback={
            <button
              type="button"
              onClick={() => switchMode("totp")}
              class={`${LINK_BUTTON_CLASS} flex items-center gap-1.5`}
            >
              <Smartphone size={14} stroke-width={1.75} />
              Use your authenticator app instead
            </button>
          }
        >
          <button
            type="button"
            onClick={() => switchMode("backup")}
            class={`${LINK_BUTTON_CLASS} flex items-center gap-1.5`}
          >
            <KeyRound size={14} stroke-width={1.75} />
            Lost access to authenticator? Use a backup code
          </button>
        </Show>
        <a
          href={ROUTES.LOGIN}
          class="text-xs text-foreground-muted underline-offset-2 hover:underline"
        >
          Back to sign in
        </a>
      </div>
    </form>
  );
}
