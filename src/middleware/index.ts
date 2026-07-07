import { createMiddleware } from "@solidjs/start/middleware";

const ALLOWED_ORIGINS = [
  "https://share.digitalcovet.com",
  "https://portfolio.digitalcovet.com",
  "http://localhost:3000",
  "http://localhost:5173",
];

function applyCorsHeaders(headers: Headers, origin: string) {
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Credentials", "true");
  headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  headers.set("Access-Control-Max-Age", "86400");
  headers.append(
    "Vary",
    "Origin, Access-Control-Request-Method, Access-Control-Request-Headers"
  );
}

function isAllowedOrigin(origin: string | null): boolean {
  return !!origin && ALLOWED_ORIGINS.includes(origin);
}

function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("Origin");
  // Same-origin requests don't send Origin header
  if (!origin) return true;
  try {
    const requestOrigin = new URL(request.url).origin;
    return requestOrigin === origin;
  } catch {
    return false;
  }
}

export default createMiddleware({
  onRequest: ({ request }) => {
    const origin = request.headers.get("Origin");
    const pathname = new URL(request.url).pathname;

    // Only apply CORS to auth endpoints
    if (!pathname.startsWith("/api/auth")) {
      // Block unauthorized cross-origin requests to non-auth endpoints
      if (!isSameOriginRequest(request) && !isAllowedOrigin(origin)) {
        return new Response("Forbidden", { status: 403 });
      }
      return;
    }

    // Allow same-origin requests (no Origin header)
    if (!origin && isSameOriginRequest(request)) {
      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204 });
      }
      return;
    }

    // Validate origin for cross-origin requests
    if (!isAllowedOrigin(origin)) {
      // Block unauthorized cross-origin requests
      if (request.method !== "GET" && request.method !== "HEAD") {
        return new Response("Forbidden", { status: 403 });
      }
      // For GET/HEAD, just skip CORS headers (browser will block response)
      return;
    }

    // Handle preflight
    if (request.method === "OPTIONS") {
      const headers = new Headers();
      applyCorsHeaders(headers, origin);
      return new Response(null, { status: 204, headers });
    }
  },

  onBeforeResponse: ({ request, response }) => {
    const origin = request.headers.get("Origin");
    const pathname = new URL(request.url).pathname;

    if (!pathname.startsWith("/api/auth")) {
      return;
    }

    // Add CORS headers for allowed origins
    if (isAllowedOrigin(origin)) {
      applyCorsHeaders(response.headers, origin);
    }
  },
});
