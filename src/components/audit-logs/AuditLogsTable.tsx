import { Avatar } from "@ark-ui/solid/avatar";
import type { Component } from "solid-js";
import { For } from "solid-js";
import type { AuditLogEntry } from "@/types";
import AuditLogStatusIndicator from "./AuditLogStatusIndicator";
import Pagination from "../user-directory/Pagination";

const columns = [
  "Actor",
  "Event",
  "Target App",
  "IP Address",
  "Location",
  "Status",
  "Timestamp",
];

interface AuditLogsTableProps {
  logs: AuditLogEntry[];
  page: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
}

const targetAppBadgeClasses: Record<string, string> = {
  "IAM System": "bg-accent text-accent-foreground",
  Share: "bg-muted text-muted-foreground border border-border",
  Portfolio: "bg-secondary text-secondary-foreground",
};

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year}, ${hours}:${minutes}`;
}

const AuditLogsTable: Component<AuditLogsTableProps> = (props) => {
  const pageSize = () => props.pageSize ?? 5;

  const totalPages = () => Math.ceil(props.logs.length / pageSize());

  const paginatedLogs = () => {
    const start = (props.page - 1) * pageSize();
    return props.logs.slice(start, start + pageSize());
  };

  return (
    <div class="overflow-hidden rounded-xl border border-border bg-card shadow-[0_4px_6px_-1px_rgb(0,0,0,0.05)]">
      {/* Table Header */}
      <div class="flex items-center justify-between border-b border-border p-4">
        <h2 class="font-heading text-base font-semibold text-foreground">
          Security Events
        </h2>
        <span class="text-xs text-muted-foreground">
          {props.logs.length} event{props.logs.length !== 1 ? "s" : ""} found
        </span>
      </div>

      {/* Table */}
      <div class="overflow-x-auto">
        <table class="w-full min-w-200 border-collapse text-left text-sm">
          <thead>
            <tr class="border-b border-border bg-muted text-xs uppercase tracking-wider text-muted-foreground">
              <For each={columns}>
                {(column) => (
                  <th scope="col" class="px-4 py-3 font-heading font-medium">
                    {column}
                  </th>
                )}
              </For>
            </tr>
          </thead>
          <tbody class="divide-y divide-border text-foreground">
            <For each={paginatedLogs()}>
              {(log) => (
                <tr class="transition-colors hover:bg-muted/50">
                  {/* Actor */}
                  <td class="px-4 py-3">
                    <div class="flex items-center">
                      <Avatar.Root
                        aria-hidden="true"
                        class="mr-3 h-8 w-8 shrink-0 rounded-full text-xs font-bold bg-muted text-muted-foreground"
                      >
                        <Avatar.Fallback class="flex h-full w-full items-center justify-center">
                          {log.actorInitials}
                        </Avatar.Fallback>
                        {log.actorAvatarUrl && (
                          <Avatar.Image
                            src={log.actorAvatarUrl}
                            alt={`Avatar of ${log.actorName}`}
                            class="h-full w-full rounded-full object-cover"
                          />
                        )}
                      </Avatar.Root>
                      <div>
                        <div class="font-medium">{log.actorName}</div>
                        <div class="text-xs text-muted-foreground">
                          {log.actorEmail}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Event */}
                  <td class="px-4 py-3">
                    <span class="font-medium">{log.event}</span>
                  </td>

                  {/* Target App */}
                  <td class="px-4 py-3">
                    <span
                      class={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${targetAppBadgeClasses[log.targetApp] ?? "bg-muted text-muted-foreground"}`}
                    >
                      {log.targetApp}
                    </span>
                  </td>

                  {/* IP Address */}
                  <td class="px-4 py-3">
                    <span class="font-mono text-xs text-muted-foreground">
                      {log.ipAddress}
                    </span>
                  </td>

                  {/* Location */}
                  <td class="px-4 py-3">
                    <span class="text-muted-foreground">{log.location}</span>
                  </td>

                  {/* Status */}
                  <td class="px-4 py-3">
                    <AuditLogStatusIndicator status={log.status} />
                  </td>

                  {/* Timestamp */}
                  <td class="px-4 py-3">
                    <span class="text-xs text-muted-foreground">
                      {formatTimestamp(log.timestamp)}
                    </span>
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {props.logs.length === 0 && (
        <div class="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <p class="text-sm font-medium">No audit log entries found</p>
          <p class="mt-1 text-xs">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}

      {/* Pagination */}
      {props.logs.length > 0 && (
        <Pagination
          count={props.logs.length}
          page={props.page}
          onPageChange={(p) => props.onPageChange(Math.min(p, totalPages()))}
          pageSize={pageSize()}
        />
      )}
    </div>
  );
};

export default AuditLogsTable;
