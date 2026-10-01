import LoaderCircle from "lucide-solid/icons/loader-circle";
import Monitor from "lucide-solid/icons/monitor";
import { createSignal, For, Show } from "solid-js";
import { messageOf, refreshAccount, unwrapClientResult } from "@/components/account-settings/action-error";
import { toaster } from "@/components/auth/auth-toaster";
import { Card, CardHeader } from "@/components/ui/card";
import { BUTTON_OUTLINE } from "@/components/ui/page-header";
import { StatusPill } from "@/components/ui/status-pill";
import { revokeOwnSession } from "@/lib/account-settings";
import { authClient } from "@/lib/auth-client";
import { formatDateTime } from "@/lib/format-date";
import type { ActiveSession } from "@/types";

function SessionRow(props: { session: ActiveSession; busy: boolean; onRevoke: (id: string) => void }) {
  return (
    <li class="flex items-center gap-3 px-4 py-3">
      <Monitor size={16} stroke-width={1.75} class="shrink-0 text-foreground-muted" />
      <div class="min-w-0 flex-1">
        <p class="flex flex-wrap items-center gap-2 text-[13.5px] font-medium">
          {props.session.device} · {props.session.browser}
          <Show when={props.session.isCurrent}>
            <StatusPill tone="success" label="This device" />
          </Show>
        </p>
        <p class="mt-0.5 font-mono text-xs text-foreground-muted">
          {props.session.ipAddress} · {props.session.location} · active {formatDateTime(props.session.lastActivity)}
        </p>
      </div>
      <Show when={!props.session.isCurrent}>
        <button
          type="button"
          disabled={props.busy}
          onClick={() => props.onRevoke(props.session.id)}
          class="h-8 shrink-0 rounded-md px-2.5 text-xs font-medium text-[#f87171] transition-colors hover:bg-red-500/10 focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50"
        >
          Revoke
        </button>
      </Show>
    </li>
  );
}

export function SessionsCard(props: { sessions: ActiveSession[] }) {
  const [busy, setBusy] = createSignal(false);
  const otherSessions = () => props.sessions.filter((session) => !session.isCurrent);

  async function run(action: () => Promise<void>, success: string) {
    setBusy(true);
    try {
      await action();
      await refreshAccount();
      toaster.create({ title: success, type: "success" });
    } catch (error) {
      toaster.create({ title: "Could not end session", description: messageOf(error, "Try again in a moment."), type: "error" });
    } finally {
      setBusy(false);
    }
  }

  const revokeOne = (id: string) => run(() => revokeOwnSession(id), "Session revoked");
  const revokeOthers = () =>
    run(async () => {
      unwrapClientResult(await authClient.revokeOtherSessions(), "Unable to sign out other devices.");
    }, "Signed out of other devices");

  return (
    <Card>
      <CardHeader
        title="Active Sessions"
        aside={
          <Show when={otherSessions().length > 0}>
            <button type="button" disabled={busy()} onClick={revokeOthers} class={`${BUTTON_OUTLINE} h-8 px-3 text-xs disabled:opacity-50`}>
              <Show when={busy()}>
                <LoaderCircle size={14} stroke-width={1.75} class="animate-spin" />
              </Show>
              Sign out all other devices
            </button>
          </Show>
        }
      />
      <ul class="divide-y divide-border-subtle">
        <For each={props.sessions}>{(session) => <SessionRow session={session} busy={busy()} onRevoke={revokeOne} />}</For>
      </ul>
    </Card>
  );
}
