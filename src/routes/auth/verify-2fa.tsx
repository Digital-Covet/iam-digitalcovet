import { Meta, Title } from "@solidjs/meta";
import { useSearchParams } from "@solidjs/router";
import TwoFactorVerify from "@/components/auth/two-factor-verify";
import { pageMetadata } from "@/lib/seo";

export default function Verify2FAPage() {
  const [searchParams] = useSearchParams();

  const search = typeof window !== "undefined" ? window.location.search : "";
  const isOAuthFlow = !!(search && search.includes("client_id=") && search.includes("response_type="));
  const oauthRedirectUrl = isOAuthFlow
    ? `${window.location.origin}/api/auth/oauth2/authorize${search}`
    : "";

  const redirectParam = Array.isArray(searchParams.redirect)
    ? searchParams.redirect[0]
    : searchParams.redirect;
  const standardRedirect = redirectParam || "/dashboard";

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
          <TwoFactorVerify
            redirectTo={isOAuthFlow ? "" : standardRedirect}
            onVerified={isOAuthFlow ? () => window.location.replace(oauthRedirectUrl) : undefined}
          />
        </div>
      </div>
    </>
  );
}
