import type { Component } from "solid-js";
import type { LucideProps } from "lucide-solid";

export type Icon = Component<LucideProps>;

export type UserRole = "SuperAdmin" | "Admin" | "Employee";
export type MfaStatus = "Enabled" | "Disabled";
export type AppAccess = "Share" | "Portfolio";
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
}

export interface NavItem {
  label: string;
  icon: Icon;
  href: string;
  active?: boolean;
}

export interface StatCardData {
  label: string;
  value: string;
  icon: Icon;
}

export interface RolePermission {
  id: string;
  label: string;
  granted: boolean;
}

export interface PermissionSection {
  id: string;
  title: string;
  permissions: RolePermission[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  summary: string;
  isCustom: boolean;
  sections: PermissionSection[];
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
  targetApp: "IAM System" | "Share" | "Portfolio";
  ipAddress: string;
  location: string;
  status: AuditLogStatus;
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
  label: string;
  description: string;
  value: string | number | boolean;
  enabled: boolean;
}
