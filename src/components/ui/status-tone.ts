import type { AuditLogStatus, ClientStatus, StatusTone } from "@/types";

export const AUDIT_OUTCOME_TONE: Record<AuditLogStatus, StatusTone> = {
  Success: "success",
  Warning: "warning",
  Failed: "critical",
};

export const TONE_DOT: Record<StatusTone, string> = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  critical: "bg-red-500",
  neutral: "bg-foreground-muted",
};

export const TONE_TEXT: Record<StatusTone, string> = {
  success: "text-emerald-800 dark:text-emerald-400",
  warning: "text-amber-800 dark:text-amber-400",
  critical: "text-red-800 dark:text-red-400",
  neutral: "text-foreground-muted",
};

export const TONE_PILL: Record<StatusTone, string> = {
  success: "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400",
  warning: "bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400",
  critical: "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  neutral: "bg-surface-raised text-foreground-muted",
};

export const CLIENT_STATUS_TONE: Record<ClientStatus, StatusTone> = {
  active: "success",
  disabled: "warning",
  unregistered: "critical",
};

export const CLIENT_STATUS_LABEL: Record<ClientStatus, string> = {
  active: "OIDC Active",
  disabled: "Disabled",
  unregistered: "Unregistered",
};
