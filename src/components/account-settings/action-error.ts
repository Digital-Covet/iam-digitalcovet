import { revalidate } from "@solidjs/router";
import { getAccountSettings } from "@/lib/account-settings";
import { authClient } from "@/lib/auth-client";

interface ClientFailure {
  message?: string;
}

/** Throws the better-auth failure as an Error so callers can share one catch path. */
export function unwrapClientResult<T>(result: { data: T | null; error: ClientFailure | null }, fallback: string): T {
  if (result.error || result.data === null) throw new Error(result.error?.message || fallback);
  return result.data;
}

export function messageOf(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export async function refreshAccount(): Promise<void> {
  // The sidebar reads the client session store, which does not follow server queries.
  authClient.$store.notify("$sessionSignal");
  await revalidate(getAccountSettings.key);
}
