import { query } from "@solidjs/router";
import { prisma } from "@/db";
import { isAdminRequest } from "@/lib/admin-session";
import { adminRole, employeeRole, superadminRole } from "@/lib/permissions";
import { toRoleLabel } from "@/lib/roles";
import { buildRoleDefinition, type RoleStatements } from "@/lib/roles-matrix";
import type { RolesAccessData, UserRole } from "@/types";

/** Highest privilege first, matching how administrators read the matrix. */
const ROLE_ORDER: ReadonlyArray<{ roleValue: string; statements: RoleStatements }> = [
  { roleValue: "superadmin", statements: superadminRole.statements },
  { roleValue: "admin", statements: adminRole.statements },
  { roleValue: "employee", statements: employeeRole.statements },
];

/** Users with no stored role fall back to the least-privileged one, as sign-in does. */
async function countUsersByRole(): Promise<Record<UserRole, number>> {
  const groups = await prisma.user.groupBy({ by: ["role"], _count: { _all: true } });
  const counts: Record<UserRole, number> = { SuperAdmin: 0, Admin: 0, Employee: 0 };
  for (const group of groups) counts[toRoleLabel(group.role)] += group._count._all;
  return counts;
}

/** Resolves to `null` when the caller is not an admin, so role definitions never reach employees. */
export const getRolesAccess = query(async (): Promise<RolesAccessData | null> => {
  "use server";
  if (!(await isAdminRequest())) return null;

  const counts = await countUsersByRole();
  return {
    roles: ROLE_ORDER.map((role) =>
      buildRoleDefinition({ ...role, userCount: counts[toRoleLabel(role.roleValue)] }),
    ),
  };
}, "rolesAccess");
