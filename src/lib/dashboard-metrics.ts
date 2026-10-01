import { ALL_APPS } from "@/lib/app-access";
import type {
  AppAccess,
  AppHealth,
  AuditLogEntry,
  ClientStatus,
  DashboardMetric,
  SessionShare,
} from "@/types";

export interface DashboardCounts {
  totalUsers: number;
  activeUsers: number;
  newUsersThisWeek: number;
  mfaEnrolledUsers: number;
  activeSessions: number;
  authFailures24h: number;
  lockedAccounts: number;
}

export interface OAuthClientRecord {
  disabled: boolean | null;
}

export interface AppHealthInput {
  app: AppAccess;
  client: OAuthClientRecord | undefined;
  authorizedUsers: number;
  tokenExchanges24h: number;
}

const EVENT_LABELS: Record<string, AuditLogEntry["event"]> = {
  granted_role: "Granted Role",
  failed_login: "Failed Login",
  file_deleted: "File Deleted",
  session_initiated: "Session Initiated",
  token_renewed: "Token Renewed",
  policy_violation: "Policy Violation",
};

const STATUS_LABELS: Record<string, AuditLogEntry["status"]> = {
  success: "Success",
  failed: "Failed",
  warning: "Warning",
};

const TARGET_APP_LABELS: Record<string, AuditLogEntry["targetApp"]> = {
  iam_system: "IAM System",
  share: "Share",
  portfolio: "Portfolio",
  desk: "Desk",
};

export const toEventLabel = (event: string) =>
  EVENT_LABELS[event] ?? "Session Initiated";
export const toStatusLabel = (status: string) =>
  STATUS_LABELS[status] ?? "Warning";
export const toTargetAppLabel = (app: string) =>
  TARGET_APP_LABELS[app] ?? "IAM System";

const formatCount = (value: number) => value.toLocaleString("en-US");

const formatPercent = (part: number, whole: number) =>
  whole === 0 ? "0%" : `${((part / whole) * 100).toFixed(1)}%`;

export function buildMetrics(counts: DashboardCounts): DashboardMetric[] {
  const unenrolled = counts.totalUsers - counts.mfaEnrolledUsers;

  return [
    {
      id: "active-users",
      label: "Active Users",
      value: formatCount(counts.activeUsers),
      detail: `+${formatCount(counts.newUsersThisWeek)} this week`,
      tone: "success",
    },
    {
      id: "active-sessions",
      label: "Active Sessions",
      value: formatCount(counts.activeSessions),
      detail: "Across Share, Portfolio, Desk",
      tone: "neutral",
    },
    {
      id: "mfa-adoption",
      label: "MFA Adoption",
      value: formatPercent(counts.mfaEnrolledUsers, counts.totalUsers),
      detail:
        unenrolled === 0
          ? "All users enrolled"
          : `${formatCount(unenrolled)} users unenrolled`,
      tone: unenrolled === 0 ? "success" : "warning",
    },
    {
      id: "auth-failures",
      label: "Auth Failures (24h)",
      value: formatCount(counts.authFailures24h),
      detail: `Lockouts: ${formatCount(counts.lockedAccounts)}`,
      tone:
        counts.authFailures24h === 0 && counts.lockedAccounts === 0
          ? "success"
          : "critical",
    },
  ];
}

function resolveClientStatus(
  client: OAuthClientRecord | undefined,
): ClientStatus {
  if (!client) return "unregistered";
  return client.disabled ? "disabled" : "active";
}

export function buildAppHealth(input: AppHealthInput): AppHealth {
  return {
    app: input.app,
    status: resolveClientStatus(input.client),
    authorizedUsers: input.authorizedUsers,
    tokenExchanges24h: input.tokenExchanges24h,
  };
}

export function buildSessionShares(
  sessionsByApp: Readonly<Record<AppAccess, number>>,
): SessionShare[] {
  const total = ALL_APPS.reduce((sum, app) => sum + sessionsByApp[app], 0);

  return ALL_APPS.map((app) => ({
    app,
    sessions: sessionsByApp[app],
    percent: total === 0 ? 0 : Math.round((sessionsByApp[app] / total) * 100),
  })).sort((a, b) => b.sessions - a.sessions);
}
