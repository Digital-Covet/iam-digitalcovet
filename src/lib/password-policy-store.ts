import { prisma } from "@/db";
import type { PasswordPolicy } from "@/types";

/** Server-only: pulls in the database client, so browser code must reach it through a server function. */
export async function loadPasswordPolicies(): Promise<PasswordPolicy[]> {
  const policies = await prisma.passwordPolicy.findMany({
    orderBy: { createdAt: "asc" },
  });
  return policies.map((p) => ({
    id: p.id,
    key: p.key,
    label: p.label,
    description: p.description,
    value: p.value as string | number | boolean,
    enabled: p.enabled,
  }));
}
