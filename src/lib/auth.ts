
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin as adminPlugin, emailOTP, jwt, organization, twoFactor } from "better-auth/plugins";
import { oauthProvider } from "@better-auth/oauth-provider";
import { prisma } from "@/db";
import { sendEmail } from "@/services/email";
import { renderDeleteVerificationEmail } from "@/services/email-templates";
import { ac, adminRole, employeeRole, superadminRole } from "./permissions";

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
  plugins: [
    twoFactor({
      issuer: "digitalcovet",
      backupCodeOptions: {
        storeBackupCodes,
      },
    }),
    adminPlugin({
      defaultRole: "employee",
      adminRole: "admin",
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
