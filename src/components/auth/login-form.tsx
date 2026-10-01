import LoaderCircle from "lucide-solid/icons/loader-circle";
import ShieldCheck from "lucide-solid/icons/shield-check";
import { createSignal, Show } from "solid-js";
import { AuthErrorAlert } from "@/components/auth/auth-error-alert";
import { PasswordField } from "@/components/ui/password-field";
import { TextField } from "@/components/ui/text-field";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/lib/constants";
import { resolveSafeRedirect } from "@/lib/safe-redirect";

const GENERIC_FAILURE = "Unable to sign in. Check your credentials and try again.";

export function LoginForm(props: { redirectTo: string | null }) {
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [error, setError] = createSignal<string | null>(null);
  const [pending, setPending] = createSignal(false);

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (pending()) return;
    setError(null);
    setPending(true);

    try {
      const { data, error: failure } = await authClient.signIn.email({
        email: email().trim(),
        password: password(),
      });

      if (failure) {
        setError(failure.message || GENERIC_FAILURE);
        return;
      }
      const handledByPlugin =
        data && ("twoFactorRedirect" in data || ("redirect" in data && data.redirect));
      if (!handledByPlugin) {
        window.location.assign(resolveSafeRedirect(props.redirectTo));
      }
    } catch {
      setError(GENERIC_FAILURE);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} class="space-y-5" novalidate>
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

      <div class="space-y-1.5">
        <PasswordField
          id="password"
          label="Password"
          autocomplete="current-password"
          required
          value={password()}
          onInput={setPassword}
          labelAside={
            <a
              href={ROUTES.FORGOT_PASSWORD}
              class="text-xs text-[#f87171] underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
            >
              Forgot password?
            </a>
          }
        />
      </div>

      <button
        type="submit"
        disabled={pending() || !email() || !password()}
        class="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-fg transition-colors duration-[120ms] hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Show when={pending()}>
          <LoaderCircle size={16} stroke-width={1.75} class="animate-spin" />
        </Show>
        {pending() ? "Signing In…" : "Sign In with Covet ID"}
      </button>

      <p class="flex items-center justify-center gap-2 text-xs text-foreground-muted">
        <ShieldCheck size={14} stroke-width={1.75} />
        Protected by enterprise 2FA &amp; device fingerprinting
      </p>
    </form>
  );
}
