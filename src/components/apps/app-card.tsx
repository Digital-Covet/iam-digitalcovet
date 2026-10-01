import ExternalLink from "lucide-solid/icons/external-link";
import Lock from "lucide-solid/icons/lock";
import { Show } from "solid-js";
import { CopyBadge } from "@/components/apps/copy-badge";
import { APP_ICONS } from "@/components/ui/app-icons";
import { Card } from "@/components/ui/card";
import { BUTTON_OUTLINE } from "@/components/ui/page-header";
import { StatusPill } from "@/components/ui/status-pill";
import { CLIENT_STATUS_LABEL, CLIENT_STATUS_TONE } from "@/components/ui/status-tone";
import type { ConnectedApp, ConnectedAppAdminDetails } from "@/types";

const LABEL = "text-[11px] font-medium uppercase tracking-[0.08em] text-foreground-muted";

const formatCount = (value: number) => value.toLocaleString("en-US");

function AdminDetails(props: { details: ConnectedAppAdminDetails }) {
  return (
    <div class="space-y-3 border-t border-border-subtle pt-3">
      <dl class="space-y-2 text-xs">
        <div class="flex flex-col gap-1">
          <dt class={LABEL}>Client ID</dt>
          <dd class="min-w-0">
            <CopyBadge value={props.details.clientId} label="client ID" />
          </dd>
        </div>
        <div class="flex flex-col gap-1">
          <dt class={LABEL}>Grant</dt>
          <dd class="font-mono">{props.details.grantLabel}</dd>
        </div>
      </dl>
      <dl class="grid grid-cols-2 gap-2 text-xs">
        <div>
          <dt class="text-foreground-muted">Authorized users</dt>
          <dd class="mt-0.5 font-mono text-sm tabular-nums">{formatCount(props.details.authorizedUsers)}</dd>
        </div>
        <div>
          <dt class="text-foreground-muted">Tokens / 24h</dt>
          <dd class="mt-0.5 font-mono text-sm tabular-nums">{formatCount(props.details.tokenExchanges24h)}</dd>
        </div>
      </dl>
    </div>
  );
}

function LaunchAction(props: { app: ConnectedApp }) {
  return (
    <Show
      when={props.app.hasAccess && props.app.launchUrl}
      fallback={
        <span class="inline-flex h-9 items-center gap-2 text-sm text-foreground-muted">
          <Lock size={14} stroke-width={1.75} />
          {props.app.status === "active" ? "No access assigned" : "Unavailable"}
        </span>
      }
    >
      {(url) => (
        <a href={url()} target="_blank" rel="noopener noreferrer" class={BUTTON_OUTLINE}>
          Launch {props.app.app}
          <ExternalLink size={14} stroke-width={1.75} />
        </a>
      )}
    </Show>
  );
}

export function AppCard(props: { app: ConnectedApp }) {
  const AppIcon = APP_ICONS[props.app.app];

  return (
    <Card class="flex flex-col overflow-hidden">
      <div class="h-[3px] bg-primary" />
      <div class="flex flex-1 flex-col gap-4 p-4">
        <div class="space-y-1">
          <div class="flex items-center justify-between gap-2">
            <h2 class="flex items-center gap-2 font-heading text-[15px] font-semibold leading-[1.35]">
              <AppIcon size={20} stroke-width={1.75} class="text-primary dark:text-[#f87171]" />
              {props.app.app}
            </h2>
            <StatusPill tone={CLIENT_STATUS_TONE[props.app.status]} label={CLIENT_STATUS_LABEL[props.app.status]} />
          </div>
          <p class="text-sm text-foreground-muted">{props.app.description}</p>
        </div>
        <Show when={props.app.admin}>{(details) => <AdminDetails details={details()} />}</Show>
        <div class="mt-auto pt-1">
          <LaunchAction app={props.app} />
        </div>
      </div>
    </Card>
  );
}
