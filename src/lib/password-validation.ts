import type { PasswordPolicy } from "@/types";

export interface PasswordCheck {
  key: string;
  label: string;
  passed: boolean;
}

export interface PasswordValidationResult {
  valid: boolean;
  checks: PasswordCheck[];
}

const validators: Record<string, (password: string, value: string | number | boolean) => boolean> = {
  min_length: (pw, val) => pw.length >= (val as number),
  require_uppercase: (pw, val) => (val as boolean) ? /[A-Z]/.test(pw) : true,
  require_lowercase: (pw, val) => (val as boolean) ? /[a-z]/.test(pw) : true,
  require_numbers: (pw, val) => (val as boolean) ? /[0-9]/.test(pw) : true,
  require_special: (pw, val) => (val as boolean) ? /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pw) : true,
};

export function validatePassword(
  password: string,
  policies: PasswordPolicy[],
): PasswordValidationResult {
  const checks: PasswordCheck[] = policies
    .filter((p) => p.enabled && validators[p.key])
    .map((p) => ({
      key: p.key,
      label: p.label,
      passed: validators[p.key](password, p.value),
    }));

  return {
    valid: checks.every((c) => c.passed),
    checks,
  };
}
