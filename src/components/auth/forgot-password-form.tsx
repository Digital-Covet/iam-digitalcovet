import ArrowLeft from "lucide-solid/icons/arrow-left";
import LoaderCircle from "lucide-solid/icons/loader-circle";
import MailCheck from "lucide-solid/icons/mail-check";
import { createSignal, Show } from "solid-js";
import { AuthErrorAlert } from "@/components/auth/auth-error-alert";
import { TONE_PILL } from "@/components/ui/status-tone";
import { TextField } from "@/components/ui/text-field";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/lib/constants";

const GENERIC_FAILURE =
  "Unable to send the reset link right now. Please try again.";

function BackToSignIn() {
  return (
    <a
      href={ROUTES.LOGIN}
      class="flex items-center justify-center gap-1.5 text-xs text-[#f87171] underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
    >
      <ArrowLeft size={14} stroke-width={1.75} />
      Back to sign in
    </a>
  );
}

function ResetLinkSent(props: { email: string; onRetry: () => void }) {
  return (
    <div class="space-y-5 text-center">
      <div
        class={`mx-auto flex h-10 w-10 items-center justify-center rounded-full ${TONE_PILL.success}`}
      >
        <MailCheck size={20} stroke-width={1.75} />
      </div>
      <div class="space-y-2">
        <h2 class="font-heading text-lg font-bold tracking-[-0.01em]">
          Check your inbox
        </h2>
        <p class="text-[13.5px] leading-[1.65] text-foreground-muted">
          If an account exists for{" "}
          <span class="break-all font-mono text-xs text-foreground">
            {props.email}
          </span>
          , a password reset link is on its way. The link expires shortly, so
          use it soon.
        </p>
      </div>
      <button
        type="button"
        onClick={props.onRetry}
        class="text-xs text-foreground-muted underline-offset-2 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-ring"
      >
        Use a different email
      </button>
      <BackToSignIn />
    </div>
  );
}

export function ForgotPasswordForm() {
  const [email, setEmail] = createSignal("");
  const [error, setError] = createSignal<string | null>(null);
  const [pending, setPending] = createSignal(false);
  const [sentTo, setSentTo] = createSignal<string | null>(null);

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (pending()) return;
    setError(null);
    setPending(true);

    const address = email().trim();
    try {
      const { error: failure } = await authClient.requestPasswordReset({
        email: address,
        redirectTo: ROUTES.RESET_PASSWORD,
      });
      if (failure && failure.status !== 404) {
        setError(failure.message || GENERIC_FAILURE);
        return;
      }
      setSentTo(address);
    } catch {
      setError(GENERIC_FAILURE);
    } finally {
      setPending(false);
    }
  }

  return (
    <Show
      when={sentTo()}
      fallback={
        <form onSubmit={handleSubmit} class="space-y-5" novalidate>
          <p class="text-[13.5px] leading-[1.65] text-foreground-muted">
            Enter the email address linked to your Covet ID and we'll send you a
            link to set a new password.
          </p>

          <AuthErrorAlert message={error()} />

          <TextField
            id="email"
            label="Email Address"
            type="email"
            autocomplete="username"
            required
            autofocus
            placeholder="you@digitalcovet.com"
            value={email()}
            onInput={setEmail}
          />

          <button
            type="submit"
            disabled={pending() || !email().trim()}
            class="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-fg transition-colors duration-[120ms] hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Show when={pending()}>
              <LoaderCircle
                size={16}
                stroke-width={1.75}
                class="animate-spin"
              />
            </Show>
            {pending() ? "Sending…" : "Send Reset Link"}
          </button>

          <BackToSignIn />
        </form>
      }
    >
      {(address) => (
        <ResetLinkSent email={address()} onRetry={() => setSentTo(null)} />
      )}
    </Show>
  );
}
