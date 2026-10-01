import { query } from "@solidjs/router";
import { getRequestEvent } from "solid-js/web";
import { prisma } from "@/db";
import { auth } from "@/lib/auth";
import { ALL_APPS, CLIENT_ID_BY_APP, CLIENT_APPS, ELEVATED_ROLES, effectiveAppAccess } from "@/lib/app-access";
import { buildConnectedApp, buildLogoutEndpoints } from "@/lib/connected-apps-model";
import { loadAppHealth } from "@/lib/dashboard-data";
import { buildAppHealth } from "@/lib/dashboard-metrics";
import type { AppAccess, AppHealth, ConnectedAppsData } from "@/types";

const CLIENT_SELECT = {
  clientId: true,
  disabled: true,
  uri: true,
  redirectUris: true,
  postLogoutRedirectUris: true,
  enableEndSession: true,
  requirePKCE: true,
  grantTypes: true,
} as const;

function loadClients() {
  return prisma.oauthClient.findMany({
    where: { clientId: { in: Object.keys(CLIENT_APPS) } },
    select: CLIENT_SELECT,
  });
}

/** Employees only need each app's status to know whether they can launch it, not its traffic. */
const statusOnlyHealth = (app: AppAccess, client: { disabled: boolean | null } | undefined): AppHealth =>
  buildAppHealth({ app, client, authorizedUsers: 0, tokenExchanges24h: 0 });

/** Resolves to `null` when nobody is signed in. Client configuration and traffic are sent to administrators only. */
export const getConnectedApps = query(async (): Promise<ConnectedAppsData | null> => {
  "use server";
  const event = getRequestEvent();
  if (!event) return null;

  const session = await auth.api.getSession({ headers: event.request.headers });
  if (!session) return null;

  const user = session.user as Record<string, unknown>;
  const isAdmin = typeof user.role === "string" && ELEVATED_ROLES.has(user.role);
  const accessibleApps = new Set(effectiveAppAccess(user));

  const [clients, adminHealth] = await Promise.all([loadClients(), isAdmin ? loadAppHealth(new Date()) : undefined]);

  const apps = ALL_APPS.map((app) => {
    const client = clients.find((candidate) => candidate.clientId === CLIENT_ID_BY_APP[app]);
    return buildConnectedApp({
      app,
      client,
      health: adminHealth?.find((health) => health.app === app) ?? statusOnlyHealth(app, client),
      hasAccess: accessibleApps.has(app),
      isAdmin,
    });
  });

  return { isAdmin, apps, logoutEndpoints: isAdmin ? buildLogoutEndpoints(clients) : [] };
}, "connectedApps");
