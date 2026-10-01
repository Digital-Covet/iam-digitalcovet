import { query } from "@solidjs/router";
import { loadPasswordPolicies } from "@/lib/password-policy-store";

export const getPasswordPolicies = query(async () => {
  "use server";
  return loadPasswordPolicies();
}, "passwordPolicies");
