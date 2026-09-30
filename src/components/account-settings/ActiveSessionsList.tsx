import type { Component } from "solid-js";
import { For, Show, createSignal } from "solid-js";
import { MonitorSmartphone, MapPin, Clock } from "lucide-solid";
import { authToaster } from "@/components/auth/auth-toaster";
import { revokeOwnSession } from "@/lib/account-settings";
import type { ActiveSession } from "@/types";
import { createAccountAction } from "./account-action";

interface ActiveSessionsListProps {
  sessions: ActiveSession[];
  onChanged: () => void;
}

const ActiveSessionsList: Component<ActiveSessionsListProps> = (props) => {
  const [revokingId, setRevokingId] = createSignal<string | null>(null);
  const { pending, error, run } = createAccountAction();

  const revoke = async (session: ActiveSession) => {
    setRevokingId(session.id);
    const revoked = await run(() => revokeOwnSession(session.id));
    setRevokingId(null);
    authToaster.create(
      revoked
        ? { title: `Signed out ${session.device}.`, type: "success" }
        : { title: error() ?? "Could not revoke that session.", type: "error" },
    );
    if (revoked) props.onChanged();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div class="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div class="mb-4 flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
          <MonitorSmartphone size={20} aria-hidden="true" class="text-primary" />
        </div>
        <div>
          <h2 class="font-heading text-lg font-semibold text-foreground">
            Active Sessions
          </h2>
          <p class="text-xs text-muted-foreground">
            {props.sessions.length} active session{props.sessions.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div class="space-y-3">
        <For each={props.sessions}>
          {(session) => (
            <div class="flex items-center gap-4 rounded-lg border border-border bg-background p-4">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-primary">
                {session.userInitials}
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <p class="truncate text-sm font-medium text-foreground">
                    {session.device}
                  </p>
                  <Show when={session.isCurrent}>
                    <span class="shrink-0 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-600">
                      Current
                    </span>
                  </Show>
                </div>
                <p class="truncate text-xs text-muted-foreground">
                  {session.browser}
                </p>
                <div class="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span class="flex items-center gap-1">
                    <MapPin size={12} aria-hidden="true" />
                    {session.location}
                  </span>
                  <span class="flex items-center gap-1">
                    <Clock size={12} aria-hidden="true" />
                    {formatDate(session.loginTime)}
                  </span>
                </div>
              </div>
              <Show when={!session.isCurrent}>
                <button
                  type="button"
                  aria-label={`Revoke session on ${session.device}`}
                  disabled={pending()}
                  onClick={() => revoke(session)}
                  class="shrink-0 rounded-md border border-border px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {revokingId() === session.id ? "Revoking..." : "Revoke"}
                </button>
              </Show>
            </div>
          )}
        </For>
      </div>
    </div>
  );
};

export default ActiveSessionsList;
