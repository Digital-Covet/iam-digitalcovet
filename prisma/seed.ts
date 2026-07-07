import "dotenv/config";
import { randomUUID, createHash } from "node:crypto";
import { PrismaClient } from "@generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

/**
 * Hash client secret using SHA-256 base64url encoding.
 * This matches better-auth's default storeClientSecret hashing.
 */
function hashClientSecret(secret: string): string {
  const hash = createHash("sha256").update(secret, "utf8").digest();
  return Buffer.from(hash).toString("base64url");
}

async function main() {
  // Clean
  await prisma.permission.deleteMany();
  await prisma.permissionSection.deleteMany();
  await prisma.role.deleteMany();
  await prisma.authMethodConfig.deleteMany();
  await prisma.passwordPolicy.deleteMany();
  await prisma.auditLog.deleteMany();

  // Permission Sections
  const shareSection = await prisma.permissionSection.create({
    data: { key: "share", title: "Share (File Sharing)" },
  });
  const portfolioSection = await prisma.permissionSection.create({
    data: { key: "portfolio", title: "Portfolio (Digital Portfolio)" },
  });
  const systemSection = await prisma.permissionSection.create({
    data: { key: "system", title: "System Administration" },
  });

  // ── Super Admin ──
  const superAdmin = await prisma.role.create({
    data: {
      name: "SuperAdmin",
      description: "Unrestricted access to all systems and settings.",
      summary: "System-wide access",
      isCustom: false,
    },
  });

  const superAdminPerms = [
    { sectionId: shareSection.id, perms: [
      { key: "share.view", label: "View Files", granted: true },
      { key: "share.transfer", label: "Upload/Download Files", granted: true },
      { key: "share.delete", label: "Delete Files", granted: true },
      { key: "share.folders", label: "Manage Folder Access", granted: true },
    ]},
    { sectionId: portfolioSection.id, perms: [
      { key: "portfolio.view", label: "View Portfolios", granted: true },
      { key: "portfolio.create", label: "Create Case Studies", granted: true },
      { key: "portfolio.publish", label: "Publish to Custom Domain", granted: true },
      { key: "portfolio.clients", label: "Manage Client Access", granted: true },
    ]},
    { sectionId: systemSection.id, perms: [
      { key: "system.users", label: "Manage Users", granted: true },
      { key: "system.audit", label: "View Audit Logs", granted: true },
      { key: "system.billing", label: "Manage Billing", granted: true },
    ]},
  ];

  for (const { sectionId, perms } of superAdminPerms) {
    await prisma.permission.createMany({
      data: perms.map((p) => ({
        ...p,
        roleId: superAdmin.id,
        sectionId,
      })),
    });
  }

  // ── Admin ──
  const admin = await prisma.role.create({
    data: {
      name: "Admin",
      description: "Full access to manage agency projects, users, and billing.",
      summary: "Department level access",
      isCustom: false,
    },
  });

  const adminPerms = [
    { sectionId: shareSection.id, perms: [
      { key: "share.view", label: "View Files", granted: true },
      { key: "share.transfer", label: "Upload/Download Files", granted: true },
      { key: "share.delete", label: "Delete Files", granted: true },
      { key: "share.folders", label: "Manage Folder Access", granted: true },
    ]},
    { sectionId: portfolioSection.id, perms: [
      { key: "portfolio.view", label: "View Portfolios", granted: true },
      { key: "portfolio.create", label: "Create Case Studies", granted: true },
      { key: "portfolio.publish", label: "Publish to Custom Domain", granted: true },
      { key: "portfolio.clients", label: "Manage Client Access", granted: true },
    ]},
    { sectionId: systemSection.id, perms: [
      { key: "system.users", label: "Manage Users", granted: true },
      { key: "system.audit", label: "View Audit Logs", granted: false },
      { key: "system.billing", label: "Manage Billing", granted: false },
    ]},
  ];

  for (const { sectionId, perms } of adminPerms) {
    await prisma.permission.createMany({
      data: perms.map((p) => ({
        ...p,
        roleId: admin.id,
        sectionId,
      })),
    });
  }

  // ── Employee ──
  const employee = await prisma.role.create({
    data: {
      name: "Employee",
      description: "Create and edit content within assigned projects.",
      summary: "Standard contributor",
      isCustom: false,
    },
  });

  const employeePerms = [
    { sectionId: shareSection.id, perms: [
      { key: "share.view", label: "View Files", granted: true },
      { key: "share.transfer", label: "Upload/Download Files", granted: true },
      { key: "share.delete", label: "Delete Files", granted: false },
      { key: "share.folders", label: "Manage Folder Access", granted: false },
    ]},
    { sectionId: portfolioSection.id, perms: [
      { key: "portfolio.view", label: "View Portfolios", granted: true },
      { key: "portfolio.create", label: "Create Case Studies", granted: true },
      { key: "portfolio.publish", label: "Publish to Custom Domain", granted: false },
      { key: "portfolio.clients", label: "Manage Client Access", granted: false },
    ]},
    { sectionId: systemSection.id, perms: [
      { key: "system.users", label: "Manage Users", granted: false },
      { key: "system.audit", label: "View Audit Logs", granted: false },
      { key: "system.billing", label: "Manage Billing", granted: false },
    ]},
  ];

  for (const { sectionId, perms } of employeePerms) {
    await prisma.permission.createMany({
      data: perms.map((p) => ({
        ...p,
        roleId: employee.id,
        sectionId,
      })),
    });
  }

  // ── Auth Method Configs ──
  await prisma.authMethodConfig.createMany({
    data: [
      { provider: "password", label: "Password Authentication", description: "Standard email and password login with configurable complexity requirements.", status: "enabled", enrolledUsers: 1284 },
      { provider: "two_factor", label: "Two-Factor Authentication", description: "TOTP-based second factor via authenticator apps. Enforce across all users or specific roles.", status: "enabled", enrolledUsers: 1261 },
      { provider: "sso_saml", label: "SAML Single Sign-On", description: "Enterprise SSO via SAML 2.0. Connect your identity provider for seamless team access.", status: "enabled", enrolledUsers: 487 },
      { provider: "sso_oidc", label: "OpenID Connect", description: "Standards-based OIDC provider integration for modern identity federation.", status: "configuring", enrolledUsers: 0 },
      { provider: "google", label: "Google Workspace", description: "Allow team members to sign in using their Google Workspace credentials.", status: "enabled", enrolledUsers: 312 },
      { provider: "microsoft", label: "Microsoft Entra ID", description: "Integrate with Microsoft Entra ID (formerly Azure AD) for enterprise authentication.", status: "disabled", enrolledUsers: 0 },
    ],
  });

  // ── Password Policies ──
  await prisma.passwordPolicy.createMany({
    data: [
      { key: "min_length", label: "Minimum Length", description: "Set the minimum number of characters required for passwords.", value: 12, enabled: true },
      { key: "require_uppercase", label: "Require Uppercase", description: "Passwords must contain at least one uppercase letter.", value: true, enabled: true },
      { key: "require_lowercase", label: "Require Lowercase", description: "Passwords must contain at least one lowercase letter.", value: true, enabled: true },
      { key: "require_numbers", label: "Require Numbers", description: "Passwords must contain at least one numeric digit.", value: true, enabled: true },
      { key: "require_special", label: "Require Special Characters", description: "Passwords must contain at least one special character (!@#$%^&*).", value: true, enabled: true },
      { key: "expiry_days", label: "Password Expiry", description: "Force password rotation after a specified number of days.", value: 90, enabled: true },
      { key: "prevent_reuse", label: "Prevent Reuse", description: "Prevent users from reusing their last N passwords.", value: 5, enabled: true },
      { key: "lockout_after", label: "Lockout After Failures", description: "Lock the account after a specified number of failed login attempts.", value: 5, enabled: true },
    ],
  });

  // ── OAuth Clients (SSO) ──
  const portfolioRedirectUri = "https://portfolio.digitalcovet.com/api/auth/oauth2/callback/portfolio";
  const portfolioDevRedirectUri = "http://localhost:3000/api/auth/oauth2/callback/portfolio";
  const plainSecret = process.env.OAUTH_CLIENT_SECRET ?? "";
  const hashedSecret = hashClientSecret(plainSecret);

  const existingClient = await prisma.oauthClient.findUnique({
    where: { clientId: "portfolio" },
  });

  if (!existingClient) {
    await prisma.oauthClient.create({
      data: {
        id: randomUUID(),
        clientId: "portfolio",
        clientSecret: hashedSecret,
        redirectUris: [portfolioRedirectUri, portfolioDevRedirectUri],
        skipConsent: true,
        enableEndSession: true,
        scopes: ["openid", "profile", "email"],
        grantTypes: ["authorization_code", "refresh_token"],
        responseTypes: ["code"],
        tokenEndpointAuthMethod: "client_secret_post",
        name: "Digital Covet Portfolio",
        uri: "https://portfolio.digitalcovet.com",
      },
    });
    console.log("Created OAuth client: portfolio");
  } else {
    // Always update to ensure correct hashed secret and redirect URIs
    const updates: Record<string, unknown> = {};
    const targetUris = [portfolioRedirectUri, portfolioDevRedirectUri];
    const currentUris = existingClient.redirectUris;
    if (JSON.stringify(currentUris.sort()) !== JSON.stringify(targetUris.sort())) {
      updates.redirectUris = targetUris;
    }
    // Always update the secret to ensure it's properly hashed
    updates.clientSecret = hashedSecret;
    if (Object.keys(updates).length > 0) {
      await prisma.oauthClient.update({
        where: { clientId: "portfolio" },
        data: updates,
      });
      console.log("Updated OAuth client 'portfolio':", Object.keys(updates).join(", "));
    } else {
      console.log("OAuth client 'portfolio' already exists, skipping");
    }
  }

  console.log("Seed complete: 3 roles, auth methods, password policies, OAuth clients");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
