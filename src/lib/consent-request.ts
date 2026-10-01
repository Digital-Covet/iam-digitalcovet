import { verifyOAuthQueryParams } from "@better-auth/oauth-provider";
import { auth } from "@/lib/auth";

/**
 * Whether the consent page's query string carries a valid, unexpired signature
 * from the OAuth provider. This does not check the client, scopes, or session.
 */
export async function verifyConsentQuery(search: string): Promise<boolean> {
  "use server";
  const query = search.replace(/^\?/, "");
  if (!query) return false;
  const { secret } = await auth.$context;
  return verifyOAuthQueryParams(query, secret);
}
