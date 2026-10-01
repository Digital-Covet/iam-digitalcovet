import ShieldCheck from "lucide-solid/icons/shield-check";
import UserX from "lucide-solid/icons/user-x";
import Users from "lucide-solid/icons/users";
import type { SelectOption } from "@/components/ui/filter-select";
import { ALL_APPS } from "@/lib/app-access";
import type { DirectoryUser, StatCardData, UserDraft, UserFilters, UserRole } from "@/types";

export const EMPTY_FILTERS: UserFilters = { query: "", role: "", app: "", status: "" };

export function hasActiveFilters(filters: UserFilters): boolean {
  return filters.query.trim() !== "" || filters.role !== "" || filters.app !== "" || filters.status !== "";
}

function matchesStatus(user: DirectoryUser, status: UserFilters["status"]): boolean {
  switch (status) {
    case "active":
      return !user.banned;
    case "banned":
      return user.banned;
    case "mfa-pending":
      return user.mfaStatus === "Disabled";
    default:
      return true;
  }
}

export function filterUsers(users: DirectoryUser[], filters: UserFilters): DirectoryUser[] {
  const query = filters.query.trim().toLowerCase();
  return users.filter(
    (user) =>
      (query === "" || user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)) &&
      (filters.role === "" || user.role === filters.role) &&
      (filters.app === "" || user.appAccess.includes(filters.app)) &&
      matchesStatus(user, filters.status),
  );
}

export function buildDirectoryStats(users: DirectoryUser[]): StatCardData[] {
  const enrolled = users.filter((user) => user.mfaStatus === "Enabled").length;
  const mfaShare = users.length === 0 ? 0 : Math.round((enrolled / users.length) * 100);
  return [
    { label: "Total Users", value: users.length.toLocaleString(), icon: Users },
    { label: "2FA Enrolled", value: `${mfaShare}%`, icon: ShieldCheck },
    { label: "Banned", value: users.filter((user) => user.banned).length.toLocaleString(), icon: UserX },
  ];
}

export const ROLE_FILTER_OPTIONS: readonly SelectOption[] = [
  { value: "", label: "All Roles" },
  { value: "SuperAdmin", label: "Superadmin" },
  { value: "Admin", label: "Admin" },
  { value: "Employee", label: "Employee" },
];

export const APP_FILTER_OPTIONS: readonly SelectOption[] = [
  { value: "", label: "All Applications" },
  ...ALL_APPS.map((app) => ({ value: app, label: app })),
];

export const STATUS_FILTER_OPTIONS: readonly SelectOption[] = [
  { value: "", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "banned", label: "Banned" },
  { value: "mfa-pending", label: "2FA Pending" },
];

export const EMPTY_DRAFT: UserDraft = {
  firstName: "",
  lastName: "",
  email: "",
  role: "Employee",
  appAccess: [],
  requireMfa: true,
};

export function toDraft(user: DirectoryUser): UserDraft {
  const [firstName = "", ...rest] = user.name.split(" ");
  return {
    firstName,
    lastName: rest.join(" "),
    email: user.email,
    role: user.role,
    appAccess: [...user.appAccess],
    requireMfa: user.mfaStatus === "Enabled",
  };
}

export function isElevatedRole(role: UserRole): boolean {
  return role !== "Employee";
}

export interface DirectoryActor {
  id: string;
  role: UserRole;
}

/** Mirrors the server rule: only a superadmin may touch another superadmin. */
export function canManageUser(actor: DirectoryActor, target: DirectoryUser): boolean {
  return actor.role === "SuperAdmin" || target.role !== "SuperAdmin";
}

export function isSelf(actor: DirectoryActor, target: DirectoryUser): boolean {
  return actor.id === target.id;
}

const CSV_HEADERS = ["Name", "Email", "Role", "2FA", "Apps", "Status"];

// A leading = + - @ would be evaluated as a formula when the file opens in a spreadsheet.
function escapeCsvCell(value: string): string {
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function toUsersCsv(users: DirectoryUser[]): string {
  const rows = users.map((user) => [
    user.name,
    user.email,
    user.role,
    user.mfaStatus,
    user.appAccess.join(" | "),
    user.banned ? "Banned" : "Active",
  ]);
  return [CSV_HEADERS, ...rows].map((row) => row.map(escapeCsvCell).join(",")).join("\r\n");
}
