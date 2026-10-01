import { ALL_APPS, ELEVATED_ROLES } from "@/lib/app-access";
import { toRoleLabel } from "@/lib/roles";
import type { PermissionGroup, RoleDefinition, RolePermission, UserRole } from "@/types";

/** Better Auth access-control statements: resource name to the actions a role may perform. */
export type RoleStatements = Readonly<Record<string, readonly string[] | undefined>>;

interface ActionSpec {
  action: string;
  label: string;
  elevated?: boolean;
}

interface StatementGroupSpec {
  id: string;
  title: string;
  resource: string;
  actions: ActionSpec[];
}

const STATEMENT_GROUPS: StatementGroupSpec[] = [
  {
    id: "directory",
    title: "IAM Directory & Users",
    resource: "user",
    actions: [
      { action: "list", label: "List users" },
      { action: "get", label: "View user profiles" },
      { action: "create", label: "Create users" },
      { action: "update", label: "Modify user records" },
      { action: "set-role", label: "Change user roles", elevated: true },
      { action: "set-email", label: "Change user emails", elevated: true },
      { action: "set-password", label: "Set user passwords", elevated: true },
      { action: "ban", label: "Suspend users" },
      { action: "delete", label: "Delete users", elevated: true },
      { action: "impersonate", label: "Impersonate users", elevated: true },
      { action: "impersonate-admins", label: "Impersonate administrators", elevated: true },
    ],
  },
  {
    id: "sessions",
    title: "Session Management",
    resource: "session",
    actions: [
      { action: "list", label: "List user sessions" },
      { action: "revoke", label: "Revoke user sessions" },
      { action: "delete", label: "Delete user sessions", elevated: true },
    ],
  },
];

const CONSOLE_ACCESS: ReadonlyArray<{ key: string; label: string }> = [
  { key: "console:telemetry", label: "View system telemetry" },
  { key: "console:oauth-clients", label: "View OAuth client configuration" },
];

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  SuperAdmin: "Full administrative control, including impersonating other administrators.",
  Admin: "Manages users, sessions and every connected app. Cannot impersonate administrators.",
  Employee: "Baseline role for company staff. Reaches only the apps assigned to each person.",
};

export interface RoleDefinitionInput {
  roleValue: string;
  statements: RoleStatements;
  userCount: number;
}

function buildAppGroup(isElevated: boolean): PermissionGroup {
  return {
    id: "apps",
    title: "Downstream App Access",
    permissions: ALL_APPS.map((app) => ({
      key: `app_access:${app.toLowerCase()}`,
      label: `Access Digital Covet ${app}`,
      access: isElevated ? "granted" : "per-user",
      elevated: false,
    })),
  };
}

function buildStatementGroup(spec: StatementGroupSpec, statements: RoleStatements): PermissionGroup {
  const allowed = statements[spec.resource] ?? [];
  return {
    id: spec.id,
    title: spec.title,
    permissions: spec.actions.map(
      (action): RolePermission => ({
        key: `${spec.resource}:${action.action}`,
        label: action.label,
        access: allowed.includes(action.action) ? "granted" : "denied",
        elevated: action.elevated ?? false,
      }),
    ),
  };
}

function buildConsoleGroup(isElevated: boolean): PermissionGroup {
  return {
    id: "console",
    title: "Console Telemetry",
    permissions: CONSOLE_ACCESS.map((entry) => ({
      ...entry,
      access: isElevated ? "granted" : "denied",
      elevated: false,
    })),
  };
}

export function buildRoleDefinition(input: RoleDefinitionInput): RoleDefinition {
  const name = toRoleLabel(input.roleValue);
  const isElevated = ELEVATED_ROLES.has(input.roleValue);

  return {
    id: input.roleValue,
    name,
    description: ROLE_DESCRIPTIONS[name],
    userCount: input.userCount,
    groups: [
      buildAppGroup(isElevated),
      ...STATEMENT_GROUPS.map((spec) => buildStatementGroup(spec, input.statements)),
      buildConsoleGroup(isElevated),
    ],
  };
}

export function countGrantedPermissions(role: RoleDefinition): { granted: number; total: number } {
  const permissions = role.groups.flatMap((group) => group.permissions);
  return {
    granted: permissions.filter((permission) => permission.access === "granted").length,
    total: permissions.length,
  };
}
