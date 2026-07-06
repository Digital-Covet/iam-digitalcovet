import { Meta, Title } from "@solidjs/meta";
import { useSearchParams } from "@solidjs/router";
import TwoFactorVerify from "@/components/auth/two-factor-verify";
import { pageMetadata } from "@/lib/seo";

function readOauthRedirectUrl(): string {
  if (typeof window === "undefined") return "";
  const search = window.location.search;
  if (!search) return "";
  const params = new URLSearchParams(search);
  if (!params.has("client_id") || !params.has("response_type")) return "";
  return `${window.location.origin}/api/auth/oauth2/authorize${search}`;
}

export default function Verify2FAPage() {
  const [searchParams] = useSearchParams();

  const oauthRedirectUrl = readOauthRedirectUrl();
  const isOAuthFlow = Boolean(oauthRedirectUrl);

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
          <TwoFactorVerify redirectTo={isOAuthFlow ? oauthRedirectUrl : standardRedirect} />
        </div>
      </div>
    </>
  );
}
