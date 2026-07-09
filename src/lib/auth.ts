
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createAuthMiddleware, APIError } from "better-auth/api";
import { admin as adminPlugin, emailOTP, jwt, organization, twoFactor } from "better-auth/plugins";
import { oauthProvider } from "@better-auth/oauth-provider";
import { prisma } from "@/db";
import { sendEmail } from "@/services/email";
import { renderDeleteVerificationEmail } from "@/services/email-templates";
import { ac, adminRole, employeeRole, superadminRole } from "./permissions";
import { createAuditLog } from "./audit";

const storeBackupCodes =
  process.env.NODE_ENV === "development" ? "plain" : "encrypted";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || (process.env.NODE_ENV === "production" ? "https://iam.digitalcovet.com" : "http://localhost:5173"),
  trustedOrigins: [
    "https://iam.digitalcovet.com",
    "https://share.digitalcovet.com",
    "https://portfolio.digitalcovet.com",
    "http://localhost:5173",
  ],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
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
        const newPassword = ctx.body?.newPassword as string | undefined;
        if (newPassword) {
          const policies = await prisma.passwordPolicy.findMany({
            where: { enabled: true },
          });

          const validators: Record<string, (pw: string, val: string | number | boolean) => boolean> = {
            min_length: (pw, val) => pw.length >= (val as number),
            require_uppercase: (pw, val) => (val as boolean) ? /[A-Z]/.test(pw) : true,
            require_lowercase: (pw, val) => (val as boolean) ? /[a-z]/.test(pw) : true,
            require_numbers: (pw, val) => (val as boolean) ? /[0-9]/.test(pw) : true,
            require_special: (pw, val) => (val as boolean) ? /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pw) : true,
          };

          for (const policy of policies) {
            const validator = validators[policy.key];
            if (validator && !validator(newPassword, policy.value as string | number | boolean)) {
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
        const body = ctx.body as Record<string, string> | undefined;
        const clientId = body?.client_id;
        const targetApp =
          clientId === "share" ? "share" :
          clientId === "portfolio" ? "portfolio" :
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
      cachedTrustedClients: new Set(["share", "portfolio"]),
      storeClientSecret: "hashed",
    }),
  ],
});
