import { auth } from "@/lib/auth";
import { toSolidStartHandler } from "better-auth/solid-start";

const handlers = toSolidStartHandler(auth);

export const GET = async (event: any) => {
  const request = event.request as Request;
  const url = new URL(request.url);

  if (url.pathname.includes("/oauth2/token")) {
    console.log("[IAM] Token endpoint GET request", { pathname: url.pathname });
  }

  if (url.pathname.includes("/oauth2/end-session")) {
    console.log("[IAM] End-session GET request", {
      pathname: url.pathname,
      id_token_hint: url.searchParams.get("id_token_hint") ? "present" : "missing",
      client_id: url.searchParams.get("client_id"),
      post_logout_redirect_uri: url.searchParams.get("post_logout_redirect_uri"),
    });
  }

  try {
    return await handlers.GET(event);
  } catch (error) {
    console.error("[IAM] GET handler error", {
      error: error instanceof Error ? error.message : String(error),
      pathname: url.pathname,
    });
    throw error;
  }
};

export const POST = async (event: any) => {
  const request = event.request as Request;
  const url = new URL(request.url);

  if (url.pathname.includes("/oauth2/token")) {
    const cloned = request.clone();
    const contentType = cloned.headers.get("content-type") || "";

    let body: Record<string, string> = {};
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const text = await cloned.text();
      body = Object.fromEntries(new URLSearchParams(text));
    } else if (contentType.includes("application/json")) {
      body = await cloned.json();
    }

    console.log("[IAM] Token exchange request", {
      grant_type: body.grant_type,
      client_id: body.client_id,
      redirect_uri: body.redirect_uri,
      hasCode: !!body.code,
      hasCodeVerifier: !!body.code_verifier,
      codeVerifierLength: body.code_verifier?.length,
      hasClientSecret: !!body.client_secret,
    });

    // TEMPORARY VERBOSE LOGGING (EXPOSES secrets): log full request body for debugging
    console.log("[IAM] Token exchange request full body:", body);
  }

  if (url.pathname.includes("/oauth2/end-session")) {
    console.log("[IAM] End-session POST request", {
      pathname: url.pathname,
    });
  }

  try {
    const response = await handlers.POST(event);

    if (url.pathname.includes("/oauth2/token")) {
      console.log("[IAM] Token exchange response", {
        status: response.status,
        ok: response.ok,
      });

      if (!response.ok) {
        const cloned = response.clone();
        const errorBody = await cloned.text();
        console.error("[IAM] Token exchange FAILED", {
          status: response.status,
          error: errorBody.substring(0, 500),
        });
      }
    }

    if (url.pathname.includes("/oauth2/end-session")) {
      console.log("[IAM] End-session response", {
        status: response.status,
        ok: response.ok,
      });

      if (!response.ok) {
        const cloned = response.clone();
        const errorBody = await cloned.text();
        console.error("[IAM] End-session FAILED", {
          status: response.status,
          error: errorBody.substring(0, 500),
        });
      }
    }

    return response;
  } catch (error) {
    console.error("[IAM] POST handler error", {
      error: error instanceof Error ? error.message : String(error),
      pathname: url.pathname,
    });
    throw error;
  }
};
