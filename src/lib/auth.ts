
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createAuthMiddleware, APIError } from "better-auth/api";
import { admin as adminPlugin, emailOTP, jwt, organization, twoFactor } from "better-auth/plugins";
import { oauthProvider } from "@better-auth/oauth-provider";
import { prisma } from "@/db";
import { sendEmail } from "@/services/email";
import { renderDeleteVerificationEmail } from "@/services/email-templates";
import { CLIENT_APPS, effectiveAppAccess } from "./app-access";
import { ac, adminRole, employeeRole, superadminRole } from "./permissions";
import { createAuditLog } from "./audit";

const storeBackupCodes =
  process.env.NODE_ENV === "development" ? "plain" : "encrypted";

/**
 * The client and user of a stored authorization code, or null for any other
 * verification row (email OTPs, reset tokens, ...).
 */
function parseAuthorizationCode(
  value: unknown,
): { clientId: string; userId: string } | null {
  if (typeof value !== "string" || !value.includes("authorization_code")) {
    return null;
  }
  try {
    const parsed = JSON.parse(value);
    if (parsed?.type !== "authorization_code") return null;
    return {
      clientId: String(parsed.query?.client_id ?? ""),
      userId: String(parsed.userId ?? ""),
    };
  } catch {
    return null;
  }
}

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || (process.env.NODE_ENV === "production" ? "https://iam.digitalcovet.com" : "http://localhost:5173"),
  trustedOrigins: [
    "https://iam.digitalcovet.com",
    "https://share.digitalcovet.com",
    "https://portfolio.digitalcovet.com",
    "https://desk.flonion.com",
    "http://localhost:5173",
    "http://localhost:3000",
  ],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  databaseHooks: {
    verification: {
      create: {
        // Every authorization code the OAuth provider issues is stored through
        // here, whichever path issued it (authorize, consent, continue, or the
        // resume after login/2FA), with the client and the user in `value`. So
        // this is the one place a user can be refused an app they may not use.
        before: async (verification) => {
          const code = parseAuthorizationCode(verification.value);
          if (!code) return;
          const app = CLIENT_APPS[code.clientId];
          const user = app
            ? await prisma.user.findUnique({
                where: { id: code.userId },
                select: { role: true, appAccess: true },
              })
            : null;
          if (!app || !user || !effectiveAppAccess(user).includes(app)) {
            console.warn("[Auth] authorization refused", {
              clientId: code.clientId,
              userId: code.userId,
            });
            throw new APIError("FORBIDDEN", {
              message: app
                ? `Your account does not have access to ${app}.`
                : "This application is not available.",
            });
          }
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }, _request) => {
      try {
        await sendEmail({
          to: user.email,
          subject: "Reset your password",
          text: `Click the link to reset your password: ${url}`,
        });
      } catch (error) {
        console.error(
          "[Auth Hook] Failed to send reset password email:",
          error instanceof Error ? error.message : error,
        );
        throw new Error("Failed to send reset password email.");
      }
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    sendVerificationEmail: async ({ user, url }, _request) => {
      try {
        await sendEmail({
          to: user.email,
          subject: "Verify your email address",
          text: `Click the link to verify your email: ${url}`,
        });
      } catch (error) {
        console.error(
          "[Auth Hook] Failed to send verification email:",
          error instanceof Error ? error.message : error,
        );
        throw new Error("Failed to send verification email.");
      }
    },
  },
  user: {
    additionalFields: {
      departmentId: {
        type: "string",
        required: false,
        defaultValue: null,
      },
      passwordChanged: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
      appAccess: {
        type: "string[]",
        required: false,
        defaultValue: [],
      },
    },
  },
  advanced: {
    ipAddress: {
      ipAddressHeaders: ["x-forwarded-for", "x-real-ip", "x-client-ip"],
    },
  },
  rateLimit: {
    customRules: {
      "/sign-in/oauth2": {
        window: 60,
        max: 5,
      },
      "/oauth2/authorize": {
        window: 60,
        max: 5,
      },
      "/oauth2/token": {
        window: 60,
        max: 10,
      },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/reset-password") {
        const newPassword: string | undefined = ctx.body?.newPassword;
        if (newPassword) {
          const policies = await prisma.passwordPolicy.findMany({
            where: { enabled: true },
          });

          const validators: Record<string, (pw: string, val: string | number | boolean) => boolean> = {
            min_length: (pw, val) => pw.length >= Number(val),
            require_uppercase: (pw, val) => val ? /[A-Z]/.test(pw) : true,
            require_lowercase: (pw, val) => val ? /[a-z]/.test(pw) : true,
            require_numbers: (pw, val) => val ? /[0-9]/.test(pw) : true,
            require_special: (pw, val) => val ? /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pw) : true,
          };

          for (const policy of policies) {
            const validator = validators[policy.key];
            const policyValue: string | number | boolean = policy.value;
            if (validator && !validator(newPassword, policyValue)) {
              throw new APIError("BAD_REQUEST", {
                message: `Password does not meet policy: ${policy.label}`,
              });
            }
          }
        }
      }
    }),
    after: createAuthMiddleware(async (ctx) => {
      const returned = ctx.context.returned;
      const isError = returned instanceof APIError;

      if (ctx.path === "/sign-in/email") {
        const session = isError ? undefined : ctx.context.newSession;
        const user = session?.user;
        console.log("[Audit] /sign-in/email", {
          isError,
          hasSession: !!session,
          hasUser: !!user,
          userId: user?.id,
          userName: user?.name,
          userEmail: user?.email,
          hasRequest: !!ctx.request,
        });
        ctx.context.runInBackground(
          createAuditLog({
            event: isError ? "failed_login" : "session_initiated",
            status: isError ? "failed" : "success",
            request: ctx.request,
            user: user ? { id: user.id, name: user.name, email: user.email, image: user.image } : undefined,
          }),
        );
      }

      if (ctx.path === "/sign-in/two-factor") {
        const session = isError ? undefined : ctx.context.newSession;
        const user = session?.user;
        ctx.context.runInBackground(
          createAuditLog({
            event: isError ? "failed_login" : "session_initiated",
            status: isError ? "failed" : "success",
            request: ctx.request,
            user: user ? { id: user.id, name: user.name, email: user.email, image: user.image } : undefined,
          }),
        );
      }

      if (ctx.path === "/oauth2/token" && !isError) {
        const body: Record<string, string> | undefined = ctx.body;
        const clientId = body?.client_id;
        const targetApp =
          clientId === "share" ? "share" :
          clientId === "portfolio" ? "portfolio" :
          clientId === "desk" ? "desk" :
          undefined;

        console.log("[Audit] /oauth2/token", {
          clientId,
          targetApp,
          hasRequest: !!ctx.request,
        });

        ctx.context.runInBackground(
          createAuditLog({
            event: "token_renewed",
            status: "success",
            request: ctx.request,
            targetApp,
          }),
        );
      }
    }),
  },
  plugins: [
    twoFactor({
      issuer: "digitalcovet",
      backupCodeOptions: {
        storeBackupCodes,
      },
    }),
    adminPlugin({
      ac,
      roles: {
        superadmin: superadminRole,
        admin: adminRole,
        employee: employeeRole,
      },
      defaultRole: "employee",
      adminRoles: ["superadmin", "admin"],
    }),
    organization({
      allowUserToCreateOrganization: false,
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        const username = email.split("@")[0];
        const { html, text } = renderDeleteVerificationEmail({
          username,
          otp,
        });
        const subject =
          type === "sign-in"
            ? "Your verification code"
            : type === "email-verification"
              ? "Verify your email"
              : "Reset your password";
        try {
          await sendEmail({
            to: email,
            subject,
            text,
            html,
          });
        } catch (error) {
          console.error(
            "[Auth Hook] Failed to send OTP email:",
            error instanceof Error ? error.message : error,
          );
          throw new Error("Failed to send verification code.");
        }
      },
    }),
    jwt(),
    oauthProvider({
      loginPage: "/auth/login",
      consentPage: "/consent",
      scopes: ["openid", "profile", "email", "offline_access"],
      cachedTrustedClients: new Set(["share", "portfolio", "desk"]),
      storeClientSecret: "hashed",
      // Lets each app confirm access on its side too (the desk refuses a
      // sign-in without "Desk" here), read fresh from the user on every call.
      customUserInfoClaims: ({ user }) => ({
        app_access: effectiveAppAccess(user),
      }),
    }),
  ],
});
