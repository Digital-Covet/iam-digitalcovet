import { createMiddleware } from "@solidjs/start/middleware";
import { json } from "@solidjs/router";

const ALLOWED_ORIGINS = [
  "https://share.digitalcovet.com",
  "https://portfolio.digitalcovet.com",
  "http://localhost:5173",
];

export default createMiddleware({
  onBeforeResponse: (event) => {
    const { request, response } = event;

    response.headers.append("Vary", "Origin, Access-Control-Request-Method");

    const origin = request.headers.get("Origin");
    const requestUrl = new URL(request.url);
    const isApiAuthRequest = requestUrl.pathname.startsWith("/api/auth");

    if (isApiAuthRequest && origin && ALLOWED_ORIGINS.includes(origin)) {
      if (
        request.method === "OPTIONS" &&
        request.headers.get("Access-Control-Request-Method")
      ) {
        return json(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Max-Age": "86400",
          },
        });
      }

      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }
  },
});
