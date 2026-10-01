import ShieldCheck from "lucide-solid/icons/shield-check";
import { TwoFactorSetupFlow } from "@/components/account-settings/two-factor-setup-flow";
import AuthGuard from "@/components/auth/auth-guard";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/lib/constants";
import {
  isOAuthFlow,
  redirectTarget,
  resolvePostAuthDestination,
} from "@/lib/oauth-flow";

async function continueAfterSetup(redirectTo: string | null) {
  const { search } = window.location;
  if (isOAuthFlow(new URLSearchParams(search))) {
    // The provider paused the authorization request here; resume it.
    const { data } = await authClient.oauth2.continue({ postLogin: true });
    const target = redirectTarget(data);
    if (target) {
      window.location.assign(target);
      return;
    }
  }
  window.location.assign(resolvePostAuthDestination(search, redirectTo));
}

async function signOut() {
  await authClient.signOut();
  window.location.assign(ROUTES.LOGIN);
}

export function TwoFactorSetup(props: { redirectTo: string | null }) {
  return (
    <AuthGuard redirectTo={ROUTES.LOGIN}>
      <div class="space-y-5">
        <div class="space-y-1">
          <h2 class="font-heading text-lg font-bold tracking-[-0.01em]">
            Set Up Two-Factor Authentication
          </h2>
          <p class="text-[13px] text-foreground-muted">
            Pair an authenticator app to add a time-based code to every sign-in.
          </p>
        </div>

        <TwoFactorSetupFlow
          mode="enable"
          showProgress
          cancelLabel="Sign Out"
          doneLabel="Continue"
          onClose={() => void signOut()}
          onFinished={() => void continueAfterSetup(props.redirectTo)}
        />

        <p class="flex items-center justify-center gap-2 border-t border-border pt-4 text-xs text-foreground-muted">
          <ShieldCheck size={14} stroke-width={1.75} />
          Codes refresh every 30 seconds and never leave your device
        </p>
      </div>
    </AuthGuard>
  );
}
