import { resolveSafeRedirect } from "./safe-redirect";

export function isOAuthFlow(params: URLSearchParams): boolean {
  return (
    params.has("client_id") &&
    params.has("response_type") &&
    params.has("code_challenge")
  );
}

/** The URL an OAuth provider endpoint asks the browser to continue to, if any. */
export function redirectTarget(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const { url, redirect_uri: redirectUri } = data as {
    url?: unknown;
    redirect_uri?: unknown;
  };
  const target = url ?? redirectUri;
  return typeof target === "string" ? target : null;
}

/** Where to go once an interrupted sign-in finishes: back into the OAuth request, or the app. */
export function resolvePostAuthDestination(
  search: string,
  redirectTo: string | null,
): string {
  const params = new URLSearchParams(search);
  return isOAuthFlow(params)
    ? `/api/auth/oauth2/authorize?${params.toString()}`
    : resolveSafeRedirect(redirectTo);
}
