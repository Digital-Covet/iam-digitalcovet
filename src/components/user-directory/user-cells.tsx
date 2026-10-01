import Briefcase from "lucide-solid/icons/briefcase";
import Layers from "lucide-solid/icons/layers";
import Share2 from "lucide-solid/icons/share-2";
import { For } from "solid-js";
import { StatusPill } from "@/components/ui/status-pill";
import { AppAvatar } from "@/components/ui/avatar";
import { AppTooltip } from "@/components/ui/tooltip";
import { ALL_APPS } from "@/lib/app-access";
import type { AppAccess, DirectoryUser, Icon, UserRole } from "@/types";

const APP_ICONS: Record<AppAccess, Icon> = { Share: Share2, Portfolio: Briefcase, Desk: Layers };

const AVATAR_TONE: Record<DirectoryUser["avatarTone"], string> = {
  primary: "bg-primary/10 text-primary dark:text-red-400",
  neutral: "bg-border text-foreground",
};

const ROLE_TONE: Record<UserRole, string> = {
  SuperAdmin: "bg-primary/10 text-primary dark:text-red-400",
  Admin: "bg-surface-raised text-foreground",
  Employee: "bg-surface-raised text-foreground-muted",
};

export function IdentityCell(props: { user: DirectoryUser }) {
  return (
    <span class="flex min-w-0 items-center gap-2.5">
      <AppAvatar initials={props.user.initials} label={props.user.name} size="xs" toneClass={AVATAR_TONE[props.user.avatarTone]} />
      <span class="min-w-0 text-left">
        <span class="block truncate text-[13.5px] font-medium leading-tight">{props.user.name}</span>
        <span class="block truncate font-mono text-xs leading-tight text-foreground-muted">{props.user.email}</span>
      </span>
    </span>
  );
}

export function RoleBadge(props: { role: UserRole }) {
  return (
    <span class={`rounded px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.08em] ${ROLE_TONE[props.role]}`}>
      {props.role}
    </span>
  );
}

export function AppAccessIcons(props: { apps: AppAccess[] }) {
  return (
    <span class="flex items-center gap-1">
      <For each={ALL_APPS}>
        {(app) => {
          const AppIcon = APP_ICONS[app];
          const granted = () => props.apps.includes(app);
          return (
            <AppTooltip content={`${app}: ${granted() ? "access granted" : "no access"}`}>
              <span
                class={`flex h-6 w-6 items-center justify-center rounded ${
                  granted() ? "bg-primary/10 text-primary dark:text-red-400" : "text-foreground-muted/40"
                }`}
              >
                <AppIcon size={14} stroke-width={1.75} />
                <span class="sr-only">
                  {app}: {granted() ? "access granted" : "no access"}
                </span>
              </span>
            </AppTooltip>
          );
        }}
      </For>
    </span>
  );
}

export function UserStatusPill(props: { user: DirectoryUser }) {
  return props.user.banned ? (
    <StatusPill tone="critical" label="Suspended" />
  ) : props.user.mfaStatus === "Enabled" ? (
    <StatusPill tone="success" label="2FA enrolled" />
  ) : (
    <StatusPill tone="warning" label="2FA pending" />
  );
}
