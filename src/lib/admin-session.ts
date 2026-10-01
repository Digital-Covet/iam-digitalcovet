import { getRequestEvent } from "solid-js/web";
import { ELEVATED_ROLES } from "@/lib/app-access";
import { auth } from "@/lib/auth";

export async function isAdminRequest(): Promise<boolean> {
  const event = getRequestEvent();
  if (!event) return false;
  const session = await auth.api.getSession({ headers: event.request.headers });
  const role = (session?.user as { role?: string } | undefined)?.role;
  return role !== undefined && ELEVATED_ROLES.has(role);
}
