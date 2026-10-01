import { ALL_APPS, CLIENT_ID_BY_APP } from "@/lib/app-access";
import type { AppAccess, AppHealth, ConnectedApp, LogoutEndpoint } from "@/types";

export const FRONT_CHANNEL_LOGOUT_PATH = "/api/auth/front-channel-logout";

export interface ClientConfig {
  clientId: string;
  disabled: boolean | null;
  uri: string | null;
  redirectUris: string[];
  postLogoutRedirectUris: string[];
  enableEndSession: boolean | null;
  requirePKCE: boolean | null;
  grantTypes: string[];
}

export interface ConnectedAppInput {
  app: AppAccess;
  client: ClientConfig | undefined;
  health: AppHealth;
  hasAccess: boolean;
  isAdmin: boolean;
}

const APP_DESCRIPTIONS: Record<AppAccess, string> = {
  Share: "Asset and file distribution",
  Portfolio: "Executive presentation and project engine",
  Desk: "Internal operations and task management hub",
};

const GRANT_LABELS: Record<string, string> = {
  authorization_code: "Auth Code",
  client_credentials: "Client Credentials",
};

const isLocalhost = (uri: string) => uri.startsWith("http://localhost");

function toHttpUrl(value: string | undefined): URL | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}

/** Only http(s) targets are launchable, so a bad client record can never inject a `javascript:` link. */
export function resolveLaunchUrl(client: ClientConfig | undefined): string | null {
  if (!client) return null;
  const url = toHttpUrl(client.uri ?? undefined) ?? toHttpUrl(client.redirectUris[0]);
  return url ? url.origin : null;
}

export function describeGrant(client: ClientConfig | undefined): string {
  if (!client) return "Not configured";
  const grants = client.grantTypes.flatMap((type) => GRANT_LABELS[type] ?? []);
  const label = grants.length > 0 ? grants.join(" + ") : "Auth Code";
  return client.requirePKCE ? `${label} + PKCE` : label;
}

export function buildConnectedApp(input: ConnectedAppInput): ConnectedApp {
  const launchUrl = resolveLaunchUrl(input.client);

  return {
    app: input.app,
    description: APP_DESCRIPTIONS[input.app],
    status: input.health.status,
    launchUrl,
    hasAccess: input.hasAccess && input.health.status === "active" && launchUrl !== null,
    admin: input.isAdmin
      ? {
          clientId: input.client?.clientId ?? CLIENT_ID_BY_APP[input.app],
          grantLabel: describeGrant(input.client),
          authorizedUsers: input.health.authorizedUsers,
          tokenExchanges24h: input.health.tokenExchanges24h,
        }
      : null,
  };
}

export function buildLogoutEndpoints(clients: readonly ClientConfig[]): LogoutEndpoint[] {
  return ALL_APPS.flatMap((app) => {
    const client = clients.find((candidate) => candidate.clientId === CLIENT_ID_BY_APP[app]);
    if (!client?.enableEndSession) return [];

    return client.postLogoutRedirectUris
      .filter((uri) => !isLocalhost(uri))
      .flatMap((uri) => {
        const base = toHttpUrl(uri);
        return base ? [{ app, url: `${base.origin}${FRONT_CHANNEL_LOGOUT_PATH}`, active: !client.disabled }] : [];
      });
  });
}
