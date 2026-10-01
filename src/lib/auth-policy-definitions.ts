import type { PasswordPolicy } from "@/types";

export const POLICY_KEYS = [
  "min_length",
  "require_uppercase",
  "require_lowercase",
  "require_numbers",
  "require_special",
  "expiry_days",
  "prevent_reuse",
  "lockout_after",
  "lockout_duration_minutes",
  "notify_on_lockout",
  "require_totp",
] as const;

export type PolicyKey = (typeof POLICY_KEYS)[number];
export type PolicyValue = number | boolean;
export type PolicyValues = Record<PolicyKey, PolicyValue>;
export type PolicyGroup = "password" | "lockout";

interface PolicyBase {
  key: PolicyKey;
  group: PolicyGroup;
  label: string;
  description: string;
}

export interface ToggleDefinition extends PolicyBase {
  control: "toggle";
  fallback: boolean;
}

export interface NumericDefinition extends PolicyBase {
  control: "range" | "number";
  min: number;
  max: number;
  unit: string;
  fallback: number;
}

export type PolicyDefinition = ToggleDefinition | NumericDefinition;

export const POLICY_DEFINITIONS: readonly PolicyDefinition[] = [
  {
    key: "min_length",
    group: "password",
    control: "range",
    label: "Minimum password length",
    description: "Shortest password a user may set.",
    min: 8,
    max: 32,
    unit: "characters",
    fallback: 12,
  },
  {
    key: "require_uppercase",
    group: "password",
    control: "toggle",
    label: "Require uppercase letters",
    description: "At least one letter from A to Z.",
    fallback: true,
  },
  {
    key: "require_lowercase",
    group: "password",
    control: "toggle",
    label: "Require lowercase letters",
    description: "At least one letter from a to z.",
    fallback: true,
  },
  {
    key: "require_numbers",
    group: "password",
    control: "toggle",
    label: "Require numerical digits",
    description: "At least one digit from 0 to 9.",
    fallback: true,
  },
  {
    key: "require_special",
    group: "password",
    control: "toggle",
    label: "Require special characters",
    description: "At least one symbol such as !@#$%^&*.",
    fallback: true,
  },
  {
    key: "expiry_days",
    group: "password",
    control: "number",
    label: "Password expiry interval",
    description: "Days before a password must be rotated. 0 disables expiry.",
    min: 0,
    max: 365,
    unit: "days",
    fallback: 90,
  },
  {
    key: "prevent_reuse",
    group: "password",
    control: "number",
    label: "Prevent password reuse",
    description:
      "How many previous passwords are remembered. 0 disables the check.",
    min: 0,
    max: 24,
    unit: "passwords",
    fallback: 5,
  },
  {
    key: "lockout_after",
    group: "lockout",
    control: "number",
    label: "Maximum failed login attempts",
    description: "Consecutive failures before the account is locked.",
    min: 1,
    max: 20,
    unit: "attempts",
    fallback: 5,
  },
  {
    key: "lockout_duration_minutes",
    group: "lockout",
    control: "number",
    label: "Lockout duration",
    description: "How long a locked account stays locked.",
    min: 1,
    max: 1440,
    unit: "minutes",
    fallback: 30,
  },
  {
    key: "notify_on_lockout",
    group: "lockout",
    control: "toggle",
    label: "Notify user by email on lockout",
    description: "Send the account owner an alert when their account locks.",
    fallback: true,
  },
  {
    key: "require_totp",
    group: "lockout",
    control: "toggle",
    label: "Enforce mandatory TOTP for all roles",
    description: "Every role must complete a second factor at sign-in.",
    fallback: true,
  },
];

const definitionsByKey = new Map<string, PolicyDefinition>(
  POLICY_DEFINITIONS.map((d) => [d.key, d]),
);

export function definitionFor(key: string): PolicyDefinition | undefined {
  return definitionsByKey.get(key);
}

export function definitionsInGroup(group: PolicyGroup): PolicyDefinition[] {
  return POLICY_DEFINITIONS.filter((d) => d.group === group);
}

export function defaultPolicyValues(): PolicyValues {
  return Object.fromEntries(
    POLICY_DEFINITIONS.map((d) => [d.key, d.fallback]),
  ) as PolicyValues;
}

export function assertValidPolicyValue(
  definition: PolicyDefinition,
  value: unknown,
): asserts value is PolicyValue {
  if (definition.control === "toggle") {
    if (typeof value !== "boolean")
      throw new Error(`${definition.label} must be on or off.`);
    return;
  }
  const inRange =
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= definition.min &&
    value <= definition.max;
  if (!inRange) {
    throw new Error(
      `${definition.label} must be a whole number from ${definition.min} to ${definition.max}.`,
    );
  }
}

export interface StoredPolicy {
  value: PolicyValue;
  enabled: boolean;
}

/** Numeric rules are active only while above zero; toggles keep their state in `value`. */
export function encodePolicy(
  definition: PolicyDefinition,
  value: PolicyValue,
): StoredPolicy {
  if (definition.control === "toggle") return { value, enabled: true };
  return { value, enabled: Number(value) > 0 };
}

export function decodePolicy(
  definition: PolicyDefinition,
  stored: { value: unknown; enabled: boolean } | undefined,
): PolicyValue {
  if (!stored) return definition.fallback;
  if (definition.control === "toggle")
    return stored.enabled && stored.value === true;
  if (!stored.enabled && definition.min === 0) return 0;
  const parsed = Number(stored.value);
  return Number.isFinite(parsed) ? parsed : definition.fallback;
}

const PASSWORD_RULE_KEYS: ReadonlySet<PolicyKey> = new Set([
  "min_length",
  "require_uppercase",
  "require_lowercase",
  "require_numbers",
  "require_special",
]);

/** Shapes draft values like stored rows so they can run through the same validator sign-in uses. */
export function toPasswordPolicies(values: PolicyValues): PasswordPolicy[] {
  return POLICY_DEFINITIONS.filter((d) => PASSWORD_RULE_KEYS.has(d.key)).map(
    (d) => ({
      id: d.key,
      key: d.key,
      label: d.label,
      description: d.description,
      value: values[d.key],
      enabled:
        typeof values[d.key] === "boolean" ? (values[d.key] as boolean) : true,
    }),
  );
}
