import { createMiddleware } from "@solidjs/start/middleware";

const ALLOWED_ORIGINS = [
  "https://share.digitalcovet.com",
  "https://portfolio.digitalcovet.com",
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

export default createMiddleware({
  onRequest: ({ request }) => {
    const origin = request.headers.get("Origin");

    if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
      return;
    }

    const pathname = new URL(request.url).pathname;

    if (!pathname.startsWith("/api/auth")) {
      return;
    }

    if (request.method === "OPTIONS") {
      const headers = new Headers();
      applyCorsHeaders(headers, origin);
      return new Response(null, { status: 204, headers });
    }
  },

  onBeforeResponse: ({ request, response }) => {
    const origin = request.headers.get("Origin");

    if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
      return;
    }

    const pathname = new URL(request.url).pathname;

    if (!pathname.startsWith("/api/auth")) {
      return;
    }

    applyCorsHeaders(response.headers, origin);
  },
});
