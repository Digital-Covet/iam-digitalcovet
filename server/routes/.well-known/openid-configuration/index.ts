import { oauthProviderOpenIdConfigMetadata } from "@better-auth/oauth-provider";
import { auth } from "@/lib/auth";

const handler = oauthProviderOpenIdConfigMetadata(auth);

const ALLOWED_ORIGINS = [
  "https://portfolio.digitalcovet.com",
  "https://share.digitalcovet.com",
  "http://localhost:3000",
  "http://localhost:5173",
];

export default defineEventHandler(async (event) => {
  const request = toWebRequest(event);
  const response = await handler({ request });

  const origin = getRequestHeader(event, "origin");
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    setResponseHeader(event, "Access-Control-Allow-Origin", origin);
    setResponseHeader(event, "Access-Control-Allow-Credentials", "true");
    setResponseHeader(event, "Access-Control-Allow-Methods", "GET, OPTIONS");
    setResponseHeader(event, "Access-Control-Allow-Headers", "Content-Type");
  }

  return response;
});
