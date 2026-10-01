import { For, Show } from "solid-js";
import { Card, CardHeader } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import type { LogoutEndpoint } from "@/types";

const HEAD_CELL =
  "px-4 py-2 text-left text-[11px] font-medium uppercase tracking-[0.08em] text-foreground-muted";

export function LogoutEndpointsCard(props: { endpoints: LogoutEndpoint[] }) {
  return (
    <Card>
      <CardHeader title="Cross-App Front-Channel Logout" />
      <p class="border-b border-border px-4 py-3 text-sm text-foreground-muted">
        Configured endpoints notified upon global IAM session termination
      </p>
      <Show
        when={props.endpoints.length > 0}
        fallback={
          <p class="px-4 py-8 text-center text-sm text-foreground-muted">
            No logout endpoints are configured.
          </p>
        }
      >
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr>
                <th class={HEAD_CELL}>App</th>
                <th class={HEAD_CELL}>Notification URL</th>
                <th class={HEAD_CELL}>Status</th>
              </tr>
            </thead>
            <tbody>
              <For each={props.endpoints}>
                {(endpoint) => (
                  <tr class="h-9 border-t border-border-subtle transition-colors hover:bg-primary/5">
                    <td class="px-4 text-[13.5px]">{endpoint.app}</td>
                    <td
                      class="max-w-[360px] truncate px-4 font-mono text-xs"
                      title={endpoint.url}
                    >
                      {endpoint.url}
                    </td>
                    <td class="px-4">
                      <StatusPill
                        tone={endpoint.active ? "success" : "warning"}
                        label={endpoint.active ? "Active" : "Disabled"}
                      />
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      </Show>
    </Card>
  );
}
