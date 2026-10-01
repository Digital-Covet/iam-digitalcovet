import type { UserRole } from "@/types";

const ROLE_LABELS: Record<string, UserRole> = {
  employee: "Employee",
  admin: "Admin",
  superadmin: "SuperAdmin",
};

const ROLE_VALUES: Record<UserRole, string> = {
  Employee: "employee",
  Admin: "admin",
  SuperAdmin: "superadmin",
};

/** Falls back to the least-privileged role for any unrecognised stored value. */
export function toRoleLabel(value: string | null | undefined): UserRole {
  return ROLE_LABELS[value ?? ""] ?? "Employee";
}

export function isUserRole(label: string): label is UserRole {
  return label in ROLE_VALUES;
}

export function toRoleValue(label: UserRole): string {
  return ROLE_VALUES[label];
}
