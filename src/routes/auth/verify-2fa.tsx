import { Meta, Title } from "@solidjs/meta";
import { useSearchParams } from "@solidjs/router";
import { createSignal } from "solid-js";
import TwoFactorVerify from "@/components/auth/two-factor-verify";
import { pageMetadata } from "@/lib/seo";

export default function Verify2FAPage() {
  const [searchParams] = useSearchParams();
  const [verified, setVerified] = createSignal(false);

  const clientId = Array.isArray(searchParams.client_id)
    ? searchParams.client_id[0]
    : searchParams.client_id;
  const redirectUri = Array.isArray(searchParams.redirect_uri)
    ? searchParams.redirect_uri[0]
    : searchParams.redirect_uri;
  const isOAuthFlow = Boolean(clientId && redirectUri);

  const buildAuthorizeUrl = (): string => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (key === "oauth_query") {
        params.set(key, Array.isArray(value) ? value[0] : (value ?? ""));
      } else if (key === "client_id" || key === "redirect_uri" || key === "state"
        || key === "code_challenge" || key === "code_challenge_method"
        || key === "scope" || key === "response_type") {
        params.set(key, Array.isArray(value) ? value[0] : (value ?? ""));
      }
    }
    return `/api/auth/oauth2/authorize?${params.toString()}`;
  };

  const redirectParam = Array.isArray(searchParams.redirect)
    ? searchParams.redirect[0]
    : searchParams.redirect;
  const standardRedirect = redirectParam || "/dashboard";

  const handleVerified = () => {
    setVerified(true);
    if (isOAuthFlow) {
      window.location.replace(buildAuthorizeUrl());
    }
  };

  return (
    <>
      <Title>{pageMetadata.verify2fa.title}</Title>
      <Meta name="description" content={pageMetadata.verify2fa.description} />
      <div class="flex min-h-screen items-center justify-center p-4">
        <div class="w-full max-w-md space-y-6 p-8 shadow-md">
          <div class="text-center">
            <h1 class="text-2xl font-bold tracking-tight">
              Two-Factor Authentication
            </h1>
            <p class="mt-2 text-sm">
              Enter your security code to complete sign-in.
            </p>
          </div>
          {verified() ? (
            <p class="text-sm text-center">Redirecting...</p>
          ) : (
            <TwoFactorVerify
              redirectTo={isOAuthFlow ? undefined : standardRedirect}
              onVerified={isOAuthFlow ? handleVerified : undefined}
            />
          )}
        </div>
      </div>
    </>
  );
}
