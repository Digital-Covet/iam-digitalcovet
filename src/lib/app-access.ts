import type { AppAccess } from "@/types";

/**
 * Which Digital Covet app each OAuth client signs users into, and who may use it.
 *
 * One rule for the apps launcher, the authorization-code gate and the
 * `app_access` userinfo claim, so what a user is shown and what they can
 * actually sign into cannot drift apart.
 */

/** Roles that may use every app regardless of their `appAccess` list. */
export const ELEVATED_ROLES = new Set(["superadmin", "admin"]);

export const ALL_APPS: readonly AppAccess[] = ["Share", "Portfolio", "Desk"];

/** OAuth `client_id` to the app it belongs to. */
export const CLIENT_APPS: Readonly<Record<string, AppAccess>> = {
  share: "Share",
  portfolio: "Portfolio",
  desk: "Desk",
};

export const CLIENT_ID_BY_APP = Object.fromEntries(
  Object.entries(CLIENT_APPS).map(([clientId, app]) => [app, clientId]),
) as Record<AppAccess, string>;

/** The apps a user may use: all of them for an elevated role, else their list. */
export function effectiveAppAccess(user: Record<string, unknown>): AppAccess[] {
  if (typeof user.role === "string" && ELEVATED_ROLES.has(user.role)) {
    return [...ALL_APPS];
  }
  if (!Array.isArray(user.appAccess)) return [];
  return ALL_APPS.filter((app) => (user.appAccess as unknown[]).includes(app));
}
