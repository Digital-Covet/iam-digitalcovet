import type { LucideProps } from "lucide-solid";
import type { Component } from "solid-js";

export type Icon = Component<LucideProps>;

export type UserRole = "SuperAdmin" | "Admin" | "Employee";
export type MfaStatus = "Enabled" | "Disabled";
export type AppAccess = "Share" | "Portfolio" | "Desk";
export type AvatarTone = "primary" | "neutral";

export interface DirectoryUser {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: UserRole;
  mfaStatus: MfaStatus;
  appAccess: AppAccess[];
  avatarTone: AvatarTone;
  banned: boolean;
  createdAt: string;
}

export type UserStatusFilter = "" | "active" | "banned" | "mfa-pending";

export interface UserFilters {
  query: string;
  role: "" | UserRole;
  app: "" | AppAccess;
  status: UserStatusFilter;
}

/** What an administrator submits to create or update a user. */
export interface UserDraft {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  appAccess: AppAccess[];
  requireMfa: boolean;
}

export interface NavItem {
  label: string;
  icon: Icon;
  href: string;
  badge?: string;
}

export interface StatCardData {
  label: string;
  value: string;
  icon: Icon;
}

/** `per-user` means the role grants nothing itself; each user is assigned it individually. */
export type PermissionAccess = "granted" | "denied" | "per-user";

export interface RolePermission {
  key: string;
  label: string;
  access: PermissionAccess;
  elevated: boolean;
}

export interface PermissionGroup {
  id: string;
  title: string;
  permissions: RolePermission[];
}

export interface RoleDefinition {
  id: string;
  name: UserRole;
  description: string;
  userCount: number;
  groups: PermissionGroup[];
}

export interface RolesAccessData {
  roles: RoleDefinition[];
}

export type AuditLogStatus = "Success" | "Failed" | "Warning";

export type AuditLogEvent =
  | "Granted Role"
  | "Failed Login"
  | "File Deleted"
  | "Session Initiated"
  | "Token Renewed"
  | "Policy Violation";

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorEmail: string;
  actorAvatarUrl?: string;
  actorInitials: string;
  event: AuditLogEvent;
  targetApp: "IAM System" | "Share" | "Portfolio" | "Desk";
  ipAddress: string;
  location: string;
  status: AuditLogStatus;
}

/* ─── Audit Ledger Types ─── */

export type AuditTimeRange = "1h" | "24h" | "7d" | "30d" | "all";

export interface AuditLedgerFilters {
  range: AuditTimeRange;
  actor: string;
  event: string;
  targetApp: string;
  status: string;
  page: number;
}

export interface AuditLedgerEntry extends AuditLogEntry {
  actorUserId: string | null;
  eventKey: string;
  targetAppKey: string;
  statusKey: string;
}

export interface AuditLedgerPage {
  entries: AuditLedgerEntry[];
  total: number;
  page: number;
  pageSize: number;
}

/* ─── Authentication Page Types ─── */

export type AuthMethodStatus = "Enabled" | "Disabled" | "Configuring";

export type AuthProviderType =
  | "Password"
  | "TwoFactor"
  | "SSO_SAML"
  | "SSO_OIDC"
  | "Google"
  | "Microsoft"
  | "GitHub";

export interface AuthMethod {
  id: string;
  provider: AuthProviderType;
  label: string;
  description: string;
  status: AuthMethodStatus;
  enrolledUsers: number;
  lastUpdated: string;
}

export interface ActiveSession {
  id: string;
  userName: string;
  userEmail: string;
  userInitials: string;
  userAvatarUrl?: string;
  device: string;
  browser: string;
  ipAddress: string;
  location: string;
  loginTime: string;
  lastActivity: string;
  isCurrent: boolean;
}

export interface PasswordPolicy {
  id: string;
  key: string;
  label: string;
  description: string;
  value: string | number | boolean;
  enabled: boolean;
}

/* ─── Dashboard Types ─── */

export type StatusTone = "success" | "warning" | "critical" | "neutral";

export interface DashboardMetric {
  id: string;
  label: string;
  value: string;
  detail: string;
  tone: StatusTone;
}

export type ClientStatus = "active" | "disabled" | "unregistered";

export interface AppHealth {
  app: AppAccess;
  status: ClientStatus;
  authorizedUsers: number;
  tokenExchanges24h: number;
}

export interface SessionShare {
  app: AppAccess;
  sessions: number;
  percent: number;
}

export interface SecurityPosture {
  pendingInvitations: number;
  unenrolledUsers: number;
  bannedUsers: number;
}

export interface DashboardData {
  metrics: DashboardMetric[];
  apps: AppHealth[];
  sessionShares: SessionShare[];
  posture: SecurityPosture;
  recentEvents: AuditLogEntry[];
}

/* ─── Connected Apps Types ─── */

/** Client configuration and traffic, only ever sent to administrators. */
export interface ConnectedAppAdminDetails {
  clientId: string;
  grantLabel: string;
  authorizedUsers: number;
  tokenExchanges24h: number;
}

export interface ConnectedApp {
  app: AppAccess;
  description: string;
  status: ClientStatus;
  launchUrl: string | null;
  hasAccess: boolean;
  admin: ConnectedAppAdminDetails | null;
}

export interface LogoutEndpoint {
  app: AppAccess;
  url: string;
  active: boolean;
}

export interface ConnectedAppsData {
  isAdmin: boolean;
  apps: ConnectedApp[];
  logoutEndpoints: LogoutEndpoint[];
}

/* ─── Account Settings Types ─── */

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: UserRole;
  department: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface AccountSecurity {
  twoFactorEnabled: boolean;
  passwordChangedAt: string | null;
  backupCodesRemaining: number | null;
}

export interface AccountSettingsData {
  user: UserProfile;
  security: AccountSecurity;
  sessions: ActiveSession[];
}
