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
          const redirect = params.get("redirect");
          const url = redirect
            ? `/auth/verify-2fa?redirect=${encodeURIComponent(redirect)}`
            : "/auth/verify-2fa";
          window.location.replace(url);
        }
      },
    }),

    emailOTPClient(),
    oauthProviderClient(),
  ],
});
