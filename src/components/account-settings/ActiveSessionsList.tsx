import type { Component } from "solid-js";
import { For, Show } from "solid-js";
import { MonitorSmartphone, MapPin, Clock } from "lucide-solid";
import type { ActiveSession } from "@/types";

interface ActiveSessionsListProps {
  sessions: ActiveSession[];
  currentSessionId?: string;
}

const ActiveSessionsList: Component<ActiveSessionsListProps> = (props) => {
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
                  <Show when={session.id === props.currentSessionId}>
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
              <Show when={session.id !== props.currentSessionId}>
                <button
                  type="button"
                  class="shrink-0 rounded-md border border-border px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  Revoke
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
