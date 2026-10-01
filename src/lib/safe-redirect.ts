import { ROUTES } from "./constants";

// Only same-origin paths are allowed so a crafted ?redirect= cannot bounce a
// freshly authenticated user to an attacker-controlled site.
export function resolveSafeRedirect(
  candidate: string | null | undefined,
  fallback: string = ROUTES.DASHBOARD,
): string {
  if (!candidate) return fallback;
  const isRelativePath = candidate.startsWith("/");
  const isProtocolRelative =
    candidate.startsWith("//") || candidate.startsWith("/\\");
  return isRelativePath && !isProtocolRelative ? candidate : fallback;
}
