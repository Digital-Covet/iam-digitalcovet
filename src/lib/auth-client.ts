import { emailOTPClient, twoFactorClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/solid";
import { oauthProviderClient } from "@better-auth/oauth-provider/client";

export const authClient = createAuthClient({
  baseURL:
    typeof window === "undefined"
      ? process.env.BETTER_AUTH_URL
      : undefined,

  plugins: [
    twoFactorClient({
      onTwoFactorRedirect() {
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);

          // Check if we're in an OAuth flow (has client_id and redirect_uri)
          const clientId = params.get("client_id");
          const redirectUri = params.get("redirect_uri");
          const isOAuthFlow = Boolean(clientId && redirectUri);

          if (isOAuthFlow) {
            // Preserve all OAuth parameters through the 2FA verification
            const oauthParams = new URLSearchParams();
            for (const [key, value] of params.entries()) {
              oauthParams.set(key, value);
            }
            const url = `/auth/verify-2fa?${oauthParams.toString()}`;
            window.location.replace(url);
          } else {
            // Standard 2FA flow - use redirect param if available
            const redirect = params.get("redirect");
            const url = redirect
              ? `/auth/verify-2fa?redirect=${encodeURIComponent(redirect)}`
              : "/auth/verify-2fa";
            window.location.replace(url);
          }
        }
      },
    }),

    emailOTPClient(),
    oauthProviderClient(),
  ],
});
