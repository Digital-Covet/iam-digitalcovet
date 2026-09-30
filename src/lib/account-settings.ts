import { query } from "@solidjs/router";
import { getRequestEvent } from "solid-js/web";
import { prisma } from "@/db";
import { auth } from "@/lib/auth";
import { resolveAvatarUrl } from "@/lib/avatar";
import { toInitials } from "@/lib/initials";
import type { AccountSettingsData, ActiveSession, UserRole } from "@/types";

const roleLabels: Record<string, UserRole> = {
  employee: "Employee",
  admin: "Admin",
  superadmin: "SuperAdmin",
};

const MAX_NAME_LENGTH = 100;

type SignedInSession = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

interface RequestSession {
  headers: Headers;
  session: SignedInSession;
}

async function findRequestSession(): Promise<RequestSession | null> {
  const event = getRequestEvent();
  if (!event) return null;
  const session = await auth.api.getSession({ headers: event.request.headers });
  return session ? { headers: event.request.headers, session } : null;
}

async function requireRequestSession(): Promise<RequestSession> {
  const current = await findRequestSession();
  if (!current) throw new Error("You are signed out. Sign in again to continue.");
  return current;
}

function describeUserAgent(userAgent: string | null) {
  const ua = userAgent ?? "";
  const deviceMatch = ua.match(/\(([^)]+)\)/);
  const browserMatch = ua.match(/(Chrome|Firefox|Safari|Edge|Opera|Arc)\/[\d.]+/);
  return {
    device: deviceMatch ? deviceMatch[1].split(";")[0] : "Unknown Device",
    browser: browserMatch ? browserMatch[0] : "Unknown Browser",
  };
}

// A user whose 2FA flag was set by an admin may have no TOTP enrollment yet,
// in which case better-auth has no backup codes to count.
async function countBackupCodes(userId: string): Promise<number | null> {
  try {
    const { backupCodes } = await auth.api.viewBackupCodes({ body: { userId } });
    return backupCodes.length;
  } catch {
    return null;
  }
}

export const getAccountSettings = query(async (): Promise<AccountSettingsData | null> => {
  "use server";
  const current = await findRequestSession();
  if (!current) return null;
  const { id: userId } = current.session.user;

  const [user, sessions, credential] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.session.findMany({
      where: { userId, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.account.findFirst({
      where: { userId, providerId: "credential" },
      select: { updatedAt: true },
    }),
  ]);
  if (!user) return null;

  const initials = user.initials ?? toInitials(user.name);
  const avatarUrl = resolveAvatarUrl(user.image) ?? null;
  const twoFactorEnabled = user.twoFactorEnabled ?? false;

  const activeSessions: ActiveSession[] = sessions.map((s) => ({
    id: s.id,
    userName: user.name,
    userEmail: user.email,
    userInitials: initials,
    userAvatarUrl: avatarUrl ?? undefined,
    ...describeUserAgent(s.userAgent),
    ipAddress: s.ipAddress ?? "N/A",
    location: s.location ?? "Unknown",
    loginTime: s.createdAt.toISOString(),
    lastActivity: (s.lastActivity ?? s.createdAt).toISOString(),
    isCurrent: s.id === current.session.session.id,
  }));

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      initials,
      role: roleLabels[user.role] ?? "Employee",
      department: user.departmentId,
      avatarUrl,
      createdAt: user.createdAt.toISOString(),
    },
    security: {
      twoFactorEnabled,
      passwordChangedAt: credential?.updatedAt.toISOString() ?? null,
      backupCodesRemaining: twoFactorEnabled ? await countBackupCodes(userId) : null,
    },
    sessions: activeSessions,
  };
}, "accountSettings");

export async function updateOwnName(name: string): Promise<void> {
  "use server";
  const { session } = await requireRequestSession();
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > MAX_NAME_LENGTH) {
    throw new Error(`Name must be between 1 and ${MAX_NAME_LENGTH} characters.`);
  }
  // Written directly because `initials` is not a better-auth field, and a
  // stored value would otherwise go stale on every rename.
  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: trimmed, initials: toInitials(trimmed) },
  });
}

export async function revokeOwnSession(sessionId: string): Promise<void> {
  "use server";
  const { headers, session } = await requireRequestSession();
  if (sessionId === session.session.id) {
    throw new Error("Sign out to end your current session.");
  }
  // Looked up by id and owner so session tokens never reach the browser.
  const target = await prisma.session.findFirst({
    where: { id: sessionId, userId: session.user.id },
    select: { token: true },
  });
  if (!target) throw new Error("That session has already ended.");
  await auth.api.revokeSession({ body: { token: target.token }, headers });
}

export async function revealBackupCodes(password: string): Promise<string[]> {
  "use server";
  const { headers, session } = await requireRequestSession();
  try {
    await auth.api.verifyPassword({ body: { password }, headers });
  } catch {
    throw new Error("Incorrect password.");
  }
  const { backupCodes } = await auth.api.viewBackupCodes({
    body: { userId: session.user.id },
  });
  return backupCodes;
}
