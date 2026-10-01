import { query } from "@solidjs/router";
import { prisma } from "@/db";
import { isAdminRequest } from "@/lib/admin-session";
import {
  assertValidPolicyValue,
  decodePolicy,
  definitionFor,
  encodePolicy,
  POLICY_DEFINITIONS,
  POLICY_KEYS,
  type PolicyValue,
  type PolicyValues,
} from "@/lib/auth-policy-definitions";

/** Resolves to `null` when the caller is not an admin, so policy thresholds never reach employees. */
export const getAuthPolicies = query(async (): Promise<PolicyValues | null> => {
  "use server";
  if (!(await isAdminRequest())) return null;

  const rows = await prisma.passwordPolicy.findMany({
    where: { key: { in: [...POLICY_KEYS] } },
  });
  const rowsByKey = new Map(rows.map((row) => [row.key, row]));
  return Object.fromEntries(
    POLICY_DEFINITIONS.map((definition) => [
      definition.key,
      decodePolicy(definition, rowsByKey.get(definition.key)),
    ]),
  ) as PolicyValues;
}, "authPolicies");

export async function saveAuthPolicies(
  changes: Partial<PolicyValues>,
): Promise<void> {
  "use server";
  if (!(await isAdminRequest())) {
    throw new Error(
      "You need an administrator role to change authentication policies.",
    );
  }

  const writes = Object.entries(changes).map(([key, value]) => {
    const definition = definitionFor(key);
    if (!definition) throw new Error(`Unknown policy: ${key}.`);
    assertValidPolicyValue(definition, value);
    const stored = encodePolicy(definition, value as PolicyValue);
    return prisma.passwordPolicy.upsert({
      where: { key },
      create: {
        key,
        label: definition.label,
        description: definition.description,
        ...stored,
      },
      update: stored,
    });
  });

  if (writes.length > 0) await prisma.$transaction(writes);
}
