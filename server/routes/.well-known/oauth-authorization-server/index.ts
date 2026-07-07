import { oauthProviderAuthServerMetadata } from "@better-auth/oauth-provider";
import { auth } from "@/lib/auth";

const handler = oauthProviderAuthServerMetadata(auth);

export default defineEventHandler(async (event) => {
  const request = toWebRequest(event);
  return handler({ request });
});
