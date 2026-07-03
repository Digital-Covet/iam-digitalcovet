import { A, useNavigate, useSearchParams } from "@solidjs/router";
import { Meta, Title } from "@solidjs/meta";
import { Check, ShieldAlert } from "lucide-solid";
import { createResource, createSignal, Show } from "solid-js";
import { authToaster, AuthToaster } from "@/components/auth/auth-toaster";
import { authClient } from "@/lib/auth-client";
import { pageMetadata } from "@/lib/seo";

const SCOPE_LABELS: Record<string, string> = {
  openid: "Verify your identity",
  profile: "View your name and profile picture",
  email: "View your email address",
  offline_access: "Maintain access until you revoke it",
};

function scopeLabel(scope: string): string {
  return SCOPE_LABELS[scope] ?? scope;
}

export default function ConsentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = createSignal(false);

  const clientId = () => searchParams.client_id as string | undefined;
  const scope = () => searchParams.scope as string | undefined;

  const [clientInfo] = createResource(clientId, async (id) => {
    const { data, error } = await authClient.oauth2.publicClient({
      query: { client_id: id },
    });
    if (error) throw new Error(error.message ?? "Failed to load client info");
    return data as Record<string, unknown> | null;
  });

  const requestedScopes = () => {
    const s = scope();
    return s ? s.split(" ").filter(Boolean) : [];
  };

  const handleConsent = async (accept: boolean) => {
    setIsSubmitting(true);
    try {
      const { error } = await authClient.oauth2.consent({
        accept,
        scope: scope() ?? undefined,
      });
      if (error) {
        throw new Error(error.message ?? "Consent request failed");
      }
      if (!accept) {
        authToaster.create({ title: "Access denied.", type: "error" });
        navigate("/", { replace: true });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Consent request failed";
      authToaster.create({ title: message, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main class="h-screen w-screen flex items-center justify-center">
      <Title>{pageMetadata.consent.title}</Title>
      <Meta name="description" content={pageMetadata.consent.description} />
      <div class="max-w-md w-full p-8 mx-auto bg-card text-card-foreground rounded-xl shadow-md">
        <div class="text-center">
          <div class="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-accent">
            <ShieldAlert class="size-6 text-primary" />
          </div>
          <h2 class="text-xl md:text-2xl font-semibold tracking-tight text-foreground font-heading">
            Authorize access
          </h2>
          <p class="text-sm mt-2 text-muted-foreground text-balance">
            <Show
              when={clientInfo()}
              fallback={<span>An application is requesting access to your account.</span>}
            >
              {(info) => {
                const client = info() as Record<string, unknown> | null;
                const displayName = (client?.clientName ?? client?.clientId ?? "Unknown application") as string;
                return (
                  <span>
                    <strong class="text-foreground">{displayName}</strong> is
                    requesting access to your account.
                  </span>
                );
              }}
            </Show>
          </p>
        </div>

        <Show when={!clientInfo.loading && requestedScopes().length > 0}>
          <div class="mt-6 space-y-2">
            <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              This will allow access to:
            </p>
            <ul class="space-y-2">
              {requestedScopes().map((s) => (
                <li class="flex items-start gap-2 text-sm text-foreground">
                  <Check class="size-4 mt-0.5 shrink-0 text-primary" />
                  <span>{scopeLabel(s)}</span>
                </li>
              ))}
            </ul>
          </div>
        </Show>

        <Show when={clientInfo.loading}>
          <div class="mt-6 space-y-2">
            <div class="h-4 w-3/4 rounded bg-muted animate-pulse" />
            <div class="h-4 w-1/2 rounded bg-muted animate-pulse" />
          </div>
        </Show>

        <div class="mt-8 flex flex-col gap-3">
          <button
            type="button"
            disabled={isSubmitting() || clientInfo.loading}
            onClick={() => handleConsent(true)}
            class="relative flex items-center justify-center text-center font-medium transition-colors duration-200 ease-in-out select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:z-10 rounded-md w-full text-primary-foreground bg-primary hover:opacity-90 focus-visible:outline-ring h-10 px-5 text-sm disabled:pointer-events-none disabled:opacity-50"
          >
            {isSubmitting() ? "Authorizing..." : "Allow access"}
          </button>
          <button
            type="button"
            disabled={isSubmitting()}
            onClick={() => handleConsent(false)}
            class="relative flex items-center justify-center text-center font-medium transition-colors duration-200 ease-in-out select-none focus-visible:outline-2 focus-visible:outline-offset-2 rounded-md w-full text-foreground bg-secondary hover:bg-secondary/80 h-10 px-5 text-sm disabled:pointer-events-none disabled:opacity-50"
          >
            Deny
          </button>
        </div>

        <p class="text-xs mt-4 text-center text-muted-foreground">
          <A href="/" class="font-medium hover:text-foreground transition-colors">
            Not you? Go back
          </A>
        </p>
      </div>
      <AuthToaster />
    </main>
  );
}
