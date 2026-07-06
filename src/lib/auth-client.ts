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
          const url = new URL(window.location.href);
          const isOAuthFlow = url.searchParams.has("client_id") && url.searchParams.has("response_type");
          if (isOAuthFlow) {
            window.location.replace(`/auth/verify-2fa${window.location.search}`);
          } else {
            const redirect = url.searchParams.get("redirect");
            const target = redirect
              ? `/auth/verify-2fa?redirect=${encodeURIComponent(redirect)}`
              : "/auth/verify-2fa";
            window.location.replace(target);
          }
        }
      },
    }),

    emailOTPClient(),
    oauthProviderClient(),
  ],
});
