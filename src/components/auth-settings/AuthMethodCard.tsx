import { Switch } from "@ark-ui/solid/switch";
import type { Component } from "solid-js";
import { KeyRound, ShieldHalf, Globe, MonitorSmartphone, Fingerprint, Lock } from "lucide-solid";
import type { AuthMethod, AuthMethodStatus, AuthProviderType } from "@/types";

const providerIcons: Record<AuthProviderType, Component<any>> = {
  Password: KeyRound,
  TwoFactor: ShieldHalf,
  SSO_SAML: Globe,
  SSO_OIDC: Globe,
  Google: MonitorSmartphone,
  Microsoft: MonitorSmartphone,
  GitHub: Globe,
};

const statusStyles: Record<AuthMethodStatus, { dot: string; text: string; badge: string }> = {
  Enabled: {
    dot: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  Disabled: {
    dot: "bg-muted-foreground",
    text: "text-muted-foreground",
    badge: "bg-muted text-muted-foreground",
  },
  Configuring: {
    dot: "bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
};

function formatLastUpdated(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const AuthMethodCard: Component<{
  method: AuthMethod;
  onToggle?: (id: string, enabled: boolean) => void;
}> = (props) => {
  const isEnabled = () => props.method.status === "Enabled";
  const isConfiguring = () => props.method.status === "Configuring";
  const styles = () => statusStyles[props.method.status];

  return (
    <div class="rounded-xl border border-border bg-card p-5 shadow-[0_4px_6px_-1px_rgb(0,0,0,0.05)] transition-shadow hover:shadow-[0_8px_16px_-4px_rgb(0,0,0,0.08)]">
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-start gap-4">
          {/* Icon */}
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted">
            {(() => {
              const Icon = providerIcons[props.method.provider] ?? KeyRound;
              return <Icon size={22} aria-hidden="true" class="text-foreground" />;
            })()}
          </div>

          <div class="min-w-0 flex-1">
            {/* Title row */}
            <div class="flex items-center gap-2">
              <h3 class="font-heading text-sm font-semibold text-foreground">
                {props.method.label}
              </h3>
              <span
                class={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${styles().badge}`}
              >
                <span class={`h-1.5 w-1.5 rounded-full ${styles().dot}`} />
                {props.method.status}
              </span>
            </div>

            {/* Description */}
            <p class="mt-1 text-xs leading-relaxed text-muted-foreground">
              {props.method.description}
            </p>

            {/* Metadata */}
            <div class="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span class="flex items-center gap-1">
                <span class="font-medium text-foreground">
                  {props.method.enrolledUsers.toLocaleString()}
                </span>{" "}
                enrolled users
              </span>
              <span class="text-border">|</span>
              <span>Updated {formatLastUpdated(props.method.lastUpdated)}</span>
            </div>
          </div>
        </div>

        {/* Toggle */}
        <div class="shrink-0 pt-1">
          <Switch.Root
            checked={isEnabled()}
            onCheckedChange={(d) => props.onToggle?.(props.method.id, d.checked)}
            class="flex cursor-pointer items-center"
          >
            <Switch.Control class="relative h-6 w-11 shrink-0 rounded-full bg-border data-[state=checked]:bg-primary">
              <Switch.Thumb class="block h-5 w-5 translate-x-0.5 translate-y-0.5 rounded-full bg-white shadow-[0_1px_2px_0_rgb(0,0,0,0.05)] data-[state=checked]:translate-x-5.5" />
            </Switch.Control>
            <Switch.HiddenInput />
          </Switch.Root>
        </div>
      </div>
    </div>
  );
};

export default AuthMethodCard;
