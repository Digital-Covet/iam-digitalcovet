import LoaderCircle from "lucide-solid/icons/loader-circle";
import ShieldCheck from "lucide-solid/icons/shield-check";
import TriangleAlert from "lucide-solid/icons/triangle-alert";
import { createEffect, createResource, createSignal, Show } from "solid-js";
import { AuthErrorAlert } from "@/components/auth/auth-error-alert";
import { ScopeList } from "@/components/consent/scope-list";
import { APP_ICONS } from "@/components/ui/app-icons";
import { CLIENT_APPS } from "@/lib/app-access";
import { authClient } from "@/lib/auth-client";
import { verifyConsentQuery } from "@/lib/consent-request";
import { ROUTES } from "@/lib/constants";
import { redirectTarget } from "@/lib/oauth-flow";
import { parseScopes } from "@/lib/oauth-scopes";

const GENERIC_FAILURE = "Unable to complete authorization. Try again.";
const PRIMARY_BUTTON_CLASS =
  "flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-fg transition-colors duration-[120ms] hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60";
const GHOST_BUTTON_CLASS =
  "flex h-10 w-full items-center justify-center rounded-md text-sm font-medium text-foreground-muted transition-colors duration-[120ms] hover:bg-surface-raised hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60";

interface ConsentRequest {
  clientId: string | null;
  scopes: string[];
}

function readConsentRequest(): ConsentRequest {
  const params = new URLSearchParams(window.location.search);
  return {
    clientId: params.get("client_id"),
    scopes: parseScopes(params.get("scope")),
  };
}

function AppIdentity(props: { clientId: string | null }) {
  const app = () => (props.clientId ? CLIENT_APPS[props.clientId] : undefined);

  return (
    <div class="flex items-center gap-3 pb-4">
      <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-surface-raised text-primary-fg">
        <Show
          when={app()}
          fallback={
            <TriangleAlert
              size={20}
              stroke-width={1.75}
              class="text-amber-500"
            />
          }
        >
          {(name) => {
            const Icon = APP_ICONS[name()];
            return (
              <Icon size={20} stroke-width={1.75} class="text-[#f87171]" />
            );
          }}
        </Show>
      </div>
      <div class="min-w-0">
        <p class="flex items-center gap-1.5 font-heading text-[15px] font-semibold">
          {app()
            ? `Digital Covet ${app()}`
            : (props.clientId ?? "Unknown application")}
          <Show when={app()}>
            <ShieldCheck
              size={15}
              stroke-width={1.75}
              class="text-blue-400"
              aria-label="Verified ecosystem app"
            />
          </Show>
        </p>
        <p class="text-xs text-foreground-muted">
          {app() ? "Digital Covet Core Engineering" : "Unverified publisher"}
        </p>
      </div>
    </div>
  );
}

function InvalidRequest() {
  return (
    <div class="space-y-4">
      <AuthErrorAlert message="This authorization request is invalid or has expired. Return to the application and start signing in again." />
      <a
        href={ROUTES.LOGIN}
        class={`${GHOST_BUTTON_CLASS} border border-border`}
      >
        Back to sign in
      </a>
    </div>
  );
}

export function ConsentView() {
  const session = authClient.useSession();
  const request = () => readConsentRequest();
  const [pending, setPending] = createSignal<"accept" | "deny" | null>(null);
  const [error, setError] = createSignal<string | null>(null);
  const appName = () => {
    const { clientId } = request();
    return clientId ? CLIENT_APPS[clientId] : undefined;
  };
  const email = () => session().data?.user.email;
  const [verified] = createResource(
    () => (email() ? window.location.search : undefined),
    verifyConsentQuery,
  );
  const verificationSettled = () =>
    verified.state === "ready" || verified.state === "errored";
  const requestIsValid = () =>
    verified.state === "ready" && verified() === true;

  createEffect(() => {
    if (!session().isPending && !session().data) {
      window.location.replace(`${ROUTES.LOGIN}${window.location.search}`);
    }
  });

  async function decide(accept: boolean) {
    if (pending()) return;
    setError(null);
    setPending(accept ? "accept" : "deny");

    try {
      const { data, error: failure } = await authClient.oauth2.consent({
        accept,
      });
      const target = redirectTarget(data);
      if (failure || !target) {
        setError(failure?.message || GENERIC_FAILURE);
        return;
      }
      window.location.assign(target);
    } catch {
      setError(GENERIC_FAILURE);
    } finally {
      setPending(null);
    }
  }

  async function switchAccount() {
    await authClient.signOut();
    window.location.assign(`${ROUTES.LOGIN}${window.location.search}`);
  }

  return (
    <Show when={email()}>
      {(signedInEmail) => (
        <Show when={verificationSettled()}>
          <Show when={requestIsValid()} fallback={<InvalidRequest />}>
            <div class="space-y-5">
              <AppIdentity clientId={request().clientId} />
              <p class="text-[13px] text-foreground-muted">
                <strong class="font-medium text-foreground">
                  {appName()
                    ? `Digital Covet ${appName()}`
                    : "This application"}
                </strong>{" "}
                is requesting permission to access your identity:
              </p>

              <Show
                when={request().scopes.length > 0}
                fallback={
                  <AuthErrorAlert message="This authorization request does not specify any permissions." />
                }
              >
                <ScopeList scopes={request().scopes} />
              </Show>

              <p class="rounded bg-surface-raised p-2.5 font-mono text-[11px] text-foreground-muted">
                PKCE Verification: Active (S256) · Strict Redirect URI Validated
              </p>

              <AuthErrorAlert message={error()} />

              <div class="flex flex-col gap-2">
                <button
                  type="button"
                  class={PRIMARY_BUTTON_CLASS}
                  disabled={pending() !== null || request().scopes.length === 0}
                  onClick={() => void decide(true)}
                >
                  <Show when={pending() === "accept"}>
                    <LoaderCircle
                      size={16}
                      stroke-width={1.75}
                      class="animate-spin"
                    />
                  </Show>
                  {pending() === "accept" ? "Authorizing…" : "Authorize Access"}
                </button>
                <button
                  type="button"
                  class={GHOST_BUTTON_CLASS}
                  disabled={pending() !== null}
                  onClick={() => void decide(false)}
                >
                  {pending() === "deny" ? "Cancelling…" : "Cancel & Return"}
                </button>
              </div>

              <p class="border-t border-border pt-4 text-center text-xs text-foreground-muted">
                Signed in as <span class="font-mono">{signedInEmail()}</span>{" "}
                (Not you?{" "}
                <button
                  type="button"
                  onClick={() => void switchAccount()}
                  class="text-[#f87171] underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
                >
                  Switch Account
                </button>
                )
              </p>
            </div>
          </Show>
        </Show>
      )}
    </Show>
  );
}
