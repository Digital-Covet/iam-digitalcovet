import { A } from "@solidjs/router";
import LoaderCircle from "lucide-solid/icons/loader-circle";
import TriangleAlert from "lucide-solid/icons/triangle-alert";
import { createSignal, onMount, Show } from "solid-js";
import { AuthErrorAlert } from "@/components/auth/auth-error-alert";
import { toaster } from "@/components/auth/auth-toaster";
import { PasswordPolicyChecklist } from "@/components/auth/password-policy-checklist";
import { PasswordField } from "@/components/ui/password-field";
import { TONE_TEXT } from "@/components/ui/status-tone";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/lib/constants";

const GENERIC_FAILURE = "Unable to reset your password. Request a new link and try again.";

const SUBMIT_CLASS =
  "flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-fg " +
  "transition-colors duration-[120ms] hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60";

/**
 * The token is read once and then scrubbed from the address bar so it does not
 * linger in browser history or leak to a third party via the Referer header.
 */
function useResetToken() {
  const [token, setToken] = createSignal<string | null>(null);
  const [checked, setChecked] = createSignal(false);

  onMount(() => {
    const url = new URL(window.location.href);
    const value = url.searchParams.get("token");
    setToken(value);
    setChecked(true);

    if (value) {
      url.searchParams.delete("token");
      window.history.replaceState(
        window.history.state,
        document.title,
        `${url.pathname}${url.search}${url.hash}`,
      );
    }
  });

  return { token, checked };
}

export function ResetPasswordForm() {
  const { token, checked } = useResetToken();
  const [password, setPassword] = createSignal("");
  const [confirm, setConfirm] = createSignal("");
  const [error, setError] = createSignal<string | null>(null);
  const [pending, setPending] = createSignal(false);

  const mismatch = () => confirm().length > 0 && confirm() !== password();
  const canSubmit = () => !pending() && password() !== "" && password() === confirm() && Boolean(token());

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (!canSubmit()) return;
    setError(null);
    setPending(true);

    try {
      const { error: failure } = await authClient.resetPassword({
        newPassword: password(),
        token: token() ?? undefined,
      });

      if (failure) {
        setError(failure.message || GENERIC_FAILURE);
        return;
      }
      toaster.create({
        title: "Password reset",
        description: "Sign in with your new password.",
        type: "success",
      });
      window.location.assign(ROUTES.LOGIN);
    } catch {
      setError(GENERIC_FAILURE);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Show when={checked()} fallback={<div class="h-40" aria-hidden="true" />}>
        <Show
          when={token()}
          fallback={
            <div role="alert" class="flex flex-col items-center gap-3 py-2 text-center">
              <TriangleAlert size={22} stroke-width={1.75} class="text-critical-text" />
              <p class="text-sm text-foreground">This reset link is missing its token or has already been used.</p>
              <A
                href={ROUTES.FORGOT_PASSWORD}
                class="text-xs text-primary underline-offset-2 hover:underline"
              >
                Request a new reset link
              </A>
            </div>
          }
        >
          <form onSubmit={handleSubmit} class="space-y-5" novalidate>
            <AuthErrorAlert message={error()} />

            <PasswordField
              id="new-password"
              label="New Password"
              autocomplete="new-password"
              required
              autofocus
              value={password()}
              onInput={setPassword}
            />
            <PasswordPolicyChecklist password={password()} />
            <PasswordField
              id="confirm-password"
              label="Confirm New Password"
              autocomplete="new-password"
              required
              value={confirm()}
              onInput={setConfirm}
            />
            <Show when={mismatch()}>
              <p role="alert" class={`text-xs ${TONE_TEXT.critical}`}>
                Passwords do not match.
              </p>
            </Show>

            <button type="submit" disabled={!canSubmit()} class={SUBMIT_CLASS}>
              <Show when={pending()}>
                <LoaderCircle size={16} stroke-width={1.75} class="animate-spin" />
              </Show>
              {pending() ? "Resetting." : "Set new password"}
            </button>
          </form>
        </Show>
      </Show>

      <p class="mt-6 flex items-center justify-center gap-1.5 text-xs text-foreground-muted">
        <A href={ROUTES.LOGIN} class="underline-offset-2 hover:text-foreground hover:underline">
          Back to sign in
        </A>
      </p>
    </>
  );
}
