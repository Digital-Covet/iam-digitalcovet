export type ScopeCategory = "Read" | "Write";

export interface ScopeDefinition {
  label: string;
  category: ScopeCategory;
  summary: string;
  risk: string;
  mandatory: boolean;
}

const SCOPE_DEFINITIONS: Readonly<Record<string, ScopeDefinition>> = {
  openid: {
    label: "OpenID Identity",
    category: "Read",
    summary: "Confirm who you are",
    risk: "The app receives a stable identifier for your account. It cannot see anything else without the other permissions listed here.",
    mandatory: true,
  },
  profile: {
    label: "OpenID Profile",
    category: "Read",
    summary: "Access your name and avatar",
    risk: "The app can read your display name and profile picture. It cannot change them.",
    mandatory: true,
  },
  email: {
    label: "Email Address",
    category: "Read",
    summary: "Access your work email address",
    risk: "The app can read your email address and whether it is verified. It cannot send email on your behalf.",
    mandatory: true,
  },
  offline_access: {
    label: "Offline Access",
    category: "Write",
    summary: "Stay signed in across browser sessions",
    risk: "The app receives a refresh token and can renew its access without asking you again, until you or an administrator revokes the session.",
    mandatory: false,
  },
};

export function describeScope(scope: string): ScopeDefinition {
  return (
    SCOPE_DEFINITIONS[scope] ?? {
      label: scope,
      category: "Write",
      summary: "Unrecognized permission",
      risk: "This permission is not part of the standard Digital Covet catalog. Only continue if you trust this application.",
      mandatory: false,
    }
  );
}

export function parseScopes(raw: string | null): string[] {
  return [...new Set((raw ?? "").split(/\s+/).filter(Boolean))];
}
