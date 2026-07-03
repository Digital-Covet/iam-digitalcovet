import { Avatar } from "@ark-ui/solid/avatar";
import type { Component } from "solid-js";
import { For, createSignal } from "solid-js";
import { MonitorSmartphone, LogOut } from "lucide-solid";
import type { ActiveSession } from "@/types";
import Pagination from "../user-directory/Pagination";

const columns = [
  "User",
  "Device",
  "Browser",
  "IP Address",
  "Location",
  "Last Activity",
  "",
];

function formatTimeAgo(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHr = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${diffDay}d ago`;
}

interface ActiveSessionsTableProps {
  sessions: ActiveSession[];
}

const PAGE_SIZE = 5;

const ActiveSessionsTable: Component<ActiveSessionsTableProps> = (props) => {
  const [page, setPage] = createSignal(1);

  const totalPages = () =>
    Math.ceil(props.sessions.length / PAGE_SIZE);

  const paginatedSessions = () => {
    const start = (page() - 1) * PAGE_SIZE;
    return props.sessions.slice(start, start + PAGE_SIZE);
  };

  return (
    <div class="overflow-hidden rounded-xl border border-border bg-card shadow-[0_4px_6px_-1px_rgb(0,0,0,0.05)]">
      {/* Header */}
      <div class="flex items-center justify-between border-b border-border p-4">
        <div>
          <h2 class="font-heading text-base font-semibold text-foreground">
            Active Sessions
          </h2>
          <p class="mt-0.5 text-xs text-muted-foreground">
            Currently logged-in sessions across all users.
          </p>
        </div>
        <span class="text-xs text-muted-foreground">
          {props.sessions.length} active session{props.sessions.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div class="overflow-x-auto">
        <table class="w-full min-w-200 border-collapse text-left text-sm">
          <thead>
            <tr class="border-b border-border bg-muted text-xs uppercase tracking-wider text-muted-foreground">
              <For each={columns}>
                {(column, index) => (
                  <th
                    scope="col"
                    class="px-4 py-3 font-heading font-medium"
                    classList={{
                      "text-right": index() === columns.length - 1,
                    }}
                  >
                    {column}
                  </th>
                )}
              </For>
            </tr>
          </thead>
          <tbody class="divide-y divide-border text-foreground">
            <For each={paginatedSessions()}>
              {(session) => (
                <tr class="transition-colors hover:bg-muted/50">
                  {/* User */}
                  <td class="px-4 py-3">
                    <div class="flex items-center">
                      <Avatar.Root
                        aria-hidden="true"
                        class={`mr-3 h-8 w-8 shrink-0 rounded-full text-xs font-bold ${session.isCurrent
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                          }`}
                      >
                        <Avatar.Fallback class="flex h-full w-full items-center justify-center">
                          {session.userInitials}
                        </Avatar.Fallback>
                        {session.userAvatarUrl && (
                          <Avatar.Image
                            src={session.userAvatarUrl}
                            alt={`Avatar of ${session.userName}`}
                            class="h-full w-full rounded-full object-cover"
                          />
                        )}
                      </Avatar.Root>
                      <div>
                        <div class="flex items-center gap-1.5">
                          <span class="font-medium">{session.userName}</span>
                          {session.isCurrent && (
                            <span class="inline-flex items-center rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-medium text-accent-foreground">
                              You
                            </span>
                          )}
                        </div>
                        <div class="text-xs text-muted-foreground">
                          {session.userEmail}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Device */}
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-1.5">
                      <MonitorSmartphone size={14} aria-hidden="true" class="text-muted-foreground" />
                      <span class="text-sm">{session.device}</span>
                    </div>
                  </td>

                  {/* Browser */}
                  <td class="px-4 py-3">
                    <span class="text-sm text-muted-foreground">{session.browser}</span>
                  </td>

                  {/* IP Address */}
                  <td class="px-4 py-3">
                    <span class="font-mono text-xs text-muted-foreground">
                      {session.ipAddress}
                    </span>
                  </td>

                  {/* Location */}
                  <td class="px-4 py-3">
                    <span class="text-sm text-muted-foreground">{session.location}</span>
                  </td>

                  {/* Last Activity */}
                  <td class="px-4 py-3">
                    <span class="text-sm text-muted-foreground">
                      {formatTimeAgo(session.lastActivity)}
                    </span>
                  </td>

                  {/* Revoke */}
                  <td class="px-4 py-3 text-right">
                    {!session.isCurrent && (
                      <button
                        type="button"
                        aria-label={`Revoke session for ${session.userName}`}
                        class="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive hover:border-destructive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      >
                        <LogOut size={12} aria-hidden="true" />
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {props.sessions.length === 0 && (
        <div class="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <p class="text-sm font-medium">No active sessions</p>
          <p class="mt-1 text-xs">All users are currently logged out.</p>
        </div>
      )}

      {/* Pagination */}
      {props.sessions.length > 0 && (
        <Pagination
          count={props.sessions.length}
          page={page()}
          onPageChange={(p) => setPage(Math.min(p, totalPages()))}
          pageSize={PAGE_SIZE}
        />
      )}
    </div>
  );
};

export default ActiveSessionsTable;
