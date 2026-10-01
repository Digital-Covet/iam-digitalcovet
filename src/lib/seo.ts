export const siteMetadata = {
  name: "IAM Digital Covet",
  description: "Secure, encrypted file sharing with end-to-end encryption. Send and receive files safely with automatic expiry and password protection.",
  url: "https://senddigitalcovet.com",
  ogImage: "/og-image.png",
  twitterHandle: "@senddigitalcovet",
} as const;

export const pageMetadata = {
  home: {
    title: "Send Digital Covet | Secure File Sharing",
    description: "Secure, encrypted file sharing with end-to-end encryption. Send and receive files safely with automatic expiry and password protection.",
  },
  dashboard: {
    title: "Dashboard | Send Digital Covet",
    description: "Manage your shared files, track downloads, and control access permissions.",
  },
  users: {
    title: "User Directory | IAM Digital Covet",
    description: "Search, invite, edit, suspend, and impersonate Digital Covet identities and their app entitlements.",
  },
  authSettings: {
    title: "Auth Policies | IAM Digital Covet",
    description: "Configure password complexity, expiry, lockout thresholds, and two-factor enforcement.",
  },
  auditLogs: {
    title: "Audit Logs | IAM Digital Covet",
    description: "Investigate authentication events, token grants, lockouts, and admin overrides across the ecosystem.",
  },
  apps: {
    title: "Applications | IAM Digital Covet",
    description: "Launch connected apps and review their single sign-on client configuration.",
  },
  rolesAccess: {
    title: "Roles & RBAC | IAM Digital Covet",
    description: "Review role permission sets across downstream apps, the user directory, and sessions.",
  },
  accountSettings: {
    title: "Account Settings | IAM Digital Covet",
    description: "Manage your profile, password, two-factor authentication, and active sessions.",
  },
  upload: {
    title: "Upload | Send Digital Covet",
    description: "Upload and encrypt files securely for sharing with automatic expiry.",
  },
  receive: {
    title: "Shared Files | Send Digital Covet",
    description: "View and download files shared with you securely.",
  },
  login: {
    title: "Sign In | Send Digital Covet",
    description: "Sign in to your Send Digital Covet account to manage your secure file transfers.",
  },
  forgotPassword: {
    title: "Forgot Password | Send Digital Covet",
    description: "Reset your password to regain access to your secure file sharing account.",
  },
  resetPassword: {
    title: "Reset Password | Send Digital Covet",
    description: "Create a new password for your Send Digital Covet account.",
  },
  verify2fa: {
    title: "Two-Factor Verification | Send Digital Covet",
    description: "Complete two-factor authentication to access your account.",
  },
  consent: {
    title: "Authorize Access | Send Digital Covet",
    description: "Review and authorize an application requesting access to your account.",
  },
  notFound: {
    title: "Page Not Found | Send Digital Covet",
    description: "The page you're looking for doesn't exist or has been moved.",
  },
  shareLink: {
    title: "Shared File | Send Digital Covet",
    description: "Access a securely shared file with end-to-end encryption.",
  },
} as const;
