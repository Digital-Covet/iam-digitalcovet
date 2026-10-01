import { PinInput } from "@ark-ui/solid/pin-input";
import { QrCode } from "@ark-ui/solid/qr-code";
import LoaderCircle from "lucide-solid/icons/loader-circle";
import { createSignal, Index, Match, Show, Switch } from "solid-js";
import {
  messageOf,
  unwrapClientResult,
} from "@/components/account-settings/action-error";
import { BackupCodeList } from "@/components/account-settings/backup-code-list";
import { AuthErrorAlert } from "@/components/auth/auth-error-alert";
import { Modal } from "@/components/ui/modal";
import { BUTTON_OUTLINE, BUTTON_PRIMARY } from "@/components/ui/page-header";
import { PasswordField } from "@/components/ui/password-field";
import { authClient } from "@/lib/auth-client";

const CODE_LENGTH = 6;
const PIN_CELLS = Array.from({ length: CODE_LENGTH }, (_, index) => index);
const PIN_CELL_CLASS =
  "h-12 w-full min-w-0 rounded-md border border-border bg-surface text-center font-mono text-lg text-foreground " +
  "tabular-nums transition-[transform,border-color] duration-[80ms] " +
  "focus:scale-105 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40 " +
  "data-[invalid]:border-critical-text disabled:opacity-60";

export type SetupMode = "enable" | "reset";
type SetupStep = "password" | "verify" | "codes";

interface SetupFlowProps {
  mode: SetupMode;
  onFinished: () => void;
  onClose: () => void;
}

interface Enrollment {
  totpURI: string;
  backupCodes: string[];
}

function secretFromUri(uri: string): string {
  return new URL(uri).searchParams.get("secret") ?? "";
}

async function beginEnrollment(
  mode: SetupMode,
  password: string,
): Promise<Enrollment> {
  // Disabling first discards the old secret and backup codes, so the previous
  // authenticator cannot keep working after a reset.
  if (mode === "reset") {
    unwrapClientResult(
      await authClient.twoFactor.disable({ password }),
      "Unable to reset two-factor authentication.",
    );
  }
  const result = unwrapClientResult(
    await authClient.twoFactor.enable({ password }),
    "Unable to start two-factor setup.",
  );
  if (!("totpURI" in result) || !result.totpURI || !result.backupCodes) {
    throw new Error("Two-factor setup returned an unexpected response.");
  }
  return { totpURI: result.totpURI, backupCodes: result.backupCodes };
}

function PasswordStep(props: {
  mode: SetupMode;
  onEnrolled: (enrollment: Enrollment) => void;
  onClose: () => void;
}) {
  const [password, setPassword] = createSignal("");
  const [error, setError] = createSignal<string | null>(null);
  const [pending, setPending] = createSignal(false);

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    if (pending() || !password()) return;
    setError(null);
    setPending(true);
    try {
      props.onEnrolled(await beginEnrollment(props.mode, password()));
    } catch (failure) {
      setError(messageOf(failure, "Unable to start two-factor setup."));
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} class="space-y-4" novalidate>
      <Show when={props.mode === "reset"}>
        <p class="rounded-md border border-border bg-surface px-3 py-2.5 text-[13px] text-foreground-muted">
          Your current authenticator and backup codes stop working immediately.
          If you leave before finishing, two-factor stays off until you set it
          up again.
        </p>
      </Show>
      <AuthErrorAlert message={error()} />
      <PasswordField
        id="setup-password"
        label="Current Password"
        autocomplete="current-password"
        autofocus
        value={password()}
        onInput={setPassword}
      />
      <div class="flex justify-end gap-2">
        <button type="button" onClick={props.onClose} class={BUTTON_OUTLINE}>
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending() || !password()}
          class={`${BUTTON_PRIMARY} disabled:cursor-not-allowed disabled:opacity-60`}
        >
          <Show when={pending()}>
            <LoaderCircle size={16} stroke-width={1.75} class="animate-spin" />
          </Show>
          Continue
        </button>
      </div>
    </form>
  );
}

function VerifyStep(props: { totpURI: string; onVerified: () => void }) {
  const [pin, setPin] = createSignal<string[]>([]);
  const [error, setError] = createSignal<string | null>(null);
  const [pending, setPending] = createSignal(false);

  async function verify(code: string) {
    if (pending()) return;
    setError(null);
    setPending(true);
    try {
      unwrapClientResult(
        await authClient.twoFactor.verifyTotp({ code }),
        "That code is not valid. Try again.",
      );
      props.onVerified();
    } catch (failure) {
      setError(messageOf(failure, "That code is not valid. Try again."));
      setPin([]);
      setPending(false);
    }
  }

  return (
    <div class="space-y-4">
      <p class="text-[13px] text-foreground-muted">
        Scan this QR code with your authenticator app, then enter the 6-digit
        code it shows.
      </p>
      <div class="flex justify-center">
        <div class="flex items-center justify-center rounded-md bg-white p-2">
          <QrCode.Root value={props.totpURI} class="h-[176px] w-[176px]">
            <QrCode.Frame class="h-full w-full fill-[#333132]">
              <QrCode.Pattern />
            </QrCode.Frame>
          </QrCode.Root>
        </div>
      </div>
      <div>
        <p class="text-[11px] font-medium uppercase tracking-[0.08em] text-foreground-muted">
          Setup Key
        </p>
        <p class="mt-1 break-all rounded bg-surface px-2 py-1.5 font-mono text-xs select-all">
          {secretFromUri(props.totpURI)}
        </p>
      </div>
      <AuthErrorAlert message={error()} />
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
        <PinInput.Label class="text-[11px] font-medium uppercase tracking-[0.08em] text-foreground-muted">
          Authentication Code
        </PinInput.Label>
        <PinInput.Control class="mt-1.5 grid grid-cols-6 gap-2">
          <Index each={PIN_CELLS}>
            {(cell) => <PinInput.Input index={cell()} class={PIN_CELL_CLASS} />}
          </Index>
        </PinInput.Control>
        <PinInput.HiddenInput />
      </PinInput.Root>
    </div>
  );
}

function CodesStep(props: { codes: string[]; onDone: () => void }) {
  return (
    <div class="space-y-4">
      <p class="text-[13px] text-foreground-muted">
        Two-factor authentication is on. Store these single-use backup codes
        somewhere safe. Each one signs you in once if you lose your
        authenticator.
      </p>
      <BackupCodeList codes={props.codes} />
      <button
        type="button"
        onClick={props.onDone}
        class={`${BUTTON_PRIMARY} w-full`}
      >
        I&apos;ve saved my codes
      </button>
    </div>
  );
}

function SetupFlow(props: SetupFlowProps) {
  const [step, setStep] = createSignal<SetupStep>("password");
  const [enrollment, setEnrollment] = createSignal<Enrollment | null>(null);

  return (
    <Switch>
      <Match when={step() === "password"}>
        <PasswordStep
          mode={props.mode}
          onClose={props.onClose}
          onEnrolled={(value) => {
            setEnrollment(value);
            setStep("verify");
          }}
        />
      </Match>
      <Match when={step() === "verify" && enrollment()}>
        {(current) => (
          <VerifyStep
            totpURI={current().totpURI}
            onVerified={() => setStep("codes")}
          />
        )}
      </Match>
      <Match when={step() === "codes" && enrollment()}>
        {(current) => (
          <CodesStep codes={current().backupCodes} onDone={props.onFinished} />
        )}
      </Match>
    </Switch>
  );
}

interface TwoFactorSetupDialogProps {
  open: boolean;
  mode: SetupMode;
  onOpenChange: (open: boolean) => void;
  onFinished: () => void;
}

export function TwoFactorSetupDialog(props: TwoFactorSetupDialogProps) {
  return (
    <Modal
      open={props.open}
      title={
        props.mode === "reset" ? "Reset Authenticator" : "Set Up Two-Factor"
      }
      onOpenChange={props.onOpenChange}
    >
      <SetupFlow
        mode={props.mode}
        onClose={() => props.onOpenChange(false)}
        onFinished={props.onFinished}
      />
    </Modal>
  );
}
