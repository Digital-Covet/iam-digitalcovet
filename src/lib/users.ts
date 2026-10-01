import { randomBytes } from "node:crypto";
import { query } from "@solidjs/router";
import { getRequestEvent } from "solid-js/web";
import { prisma } from "@/db";
import { ALL_APPS, ELEVATED_ROLES, effectiveAppAccess } from "@/lib/app-access";
import { auth } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import { toInitials } from "@/lib/initials";
import { isUserRole, toRoleLabel, toRoleValue } from "@/lib/roles";
import type { DirectoryUser, UserDraft } from "@/types";

const MAX_NAME_LENGTH = 100;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUPERADMIN = "superadmin";

interface Actor {
  id: string;
  role: string;
  headers: Headers;
}

interface ManagedTarget {
  id: string;
  role: string;
}

async function findActor(): Promise<Actor | null> {
  const event = getRequestEvent();
  if (!event) return null;
  const session = await auth.api.getSession({ headers: event.request.headers });
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || !role || !ELEVATED_ROLES.has(role)) return null;
  return { id: session.user.id, role, headers: event.request.headers };
}

async function requireActor(): Promise<Actor> {
  const actor = await findActor();
  if (!actor)
    throw new Error("You need an administrator role to manage users.");
  return actor;
}

async function requireTarget(userId: string): Promise<ManagedTarget> {
  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });
  if (!target) throw new Error("That user no longer exists.");
  return target;
}

/** Only a superadmin may touch another superadmin or hand out the role. */
function assertMayAssign(
  actor: Actor,
  currentRole: string | null,
  nextRole: string,
) {
  if (actor.role === SUPERADMIN) return;
  if (currentRole === SUPERADMIN || nextRole === SUPERADMIN) {
    throw new Error("Only a superadmin can manage superadmin accounts.");
  }
}

function assertNotSelf(actor: Actor, target: ManagedTarget, action: string) {
  if (actor.id === target.id)
    throw new Error(`You cannot ${action} your own account.`);
}

interface CleanDraft {
  name: string;
  email: string;
  role: string;
  appAccess: UserDraft["appAccess"];
}

function cleanDraft(draft: UserDraft): CleanDraft {
  const name = `${draft.firstName.trim()} ${draft.lastName.trim()}`.trim();
  const email = draft.email.trim().toLowerCase();
  if (!name || name.length > MAX_NAME_LENGTH) {
    throw new Error(
      `Name must be between 1 and ${MAX_NAME_LENGTH} characters.`,
    );
  }
  if (!EMAIL_PATTERN.test(email))
    throw new Error("Enter a valid email address.");
  if (!isUserRole(draft.role)) throw new Error("Choose a valid role.");
  return {
    name,
    email,
    role: toRoleValue(draft.role),
    appAccess: ALL_APPS.filter((app) => draft.appAccess.includes(app)),
  };
}

/** Resolves to `null` when the caller is not an admin, so nothing leaks to employees. */
export const getDirectoryUsers = query(
  async (): Promise<DirectoryUser[] | null> => {
    "use server";
    if (!(await findActor())) return null;

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      initials: user.initials ?? toInitials(user.name),
      role: toRoleLabel(user.role),
      mfaStatus: user.twoFactorEnabled ? "Enabled" : "Disabled",
      appAccess: effectiveAppAccess(user),
      avatarTone: user.avatarTone ?? "primary",
      banned: user.banned === true,
      createdAt: user.createdAt.toISOString(),
    }));
  },
  "directoryUsers",
);

export async function inviteUser(draft: UserDraft): Promise<void> {
  "use server";
  const actor = await requireActor();
  const clean = cleanDraft(draft);
  assertMayAssign(actor, null, clean.role);

  // The account starts with a random password nobody knows; the invitee sets
  // their own through the reset link emailed below.
  const { user } = await auth.api.createUser({
    body: {
      email: clean.email,
      name: clean.name,
      password: randomBytes(24).toString("base64url"),
      role: clean.role as "employee" | "admin" | "superadmin",
    },
    headers: actor.headers,
  });

  // Written directly because these are not better-auth create fields, and the
  // invitee proves the address by following the emailed link.
  await prisma.user.update({
    where: { id: user.id },
    data: {
      initials: toInitials(clean.name),
      appAccess: clean.appAccess,
      emailVerified: true,
    },
  });
  await auth.api.requestPasswordReset({
    body: { email: clean.email, redirectTo: ROUTES.RESET_PASSWORD },
  });
}

export async function updateUser(
  userId: string,
  draft: UserDraft,
): Promise<void> {
  "use server";
  const actor = await requireActor();
  const target = await requireTarget(userId);
  const clean = cleanDraft(draft);
  assertMayAssign(actor, target.role, clean.role);
  if (clean.role !== target.role)
    assertNotSelf(actor, target, "change the role of");

  if (clean.role !== target.role) {
    await auth.api.setRole({
      body: { userId, role: clean.role as "employee" | "admin" | "superadmin" },
      headers: actor.headers,
    });
  }
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: clean.name,
        email: clean.email,
        initials: toInitials(clean.name),
        appAccess: clean.appAccess,
      },
    });
  } catch {
    throw new Error("That email address is already in use.");
  }
}

export async function setUserBanned(
  userId: string,
  banned: boolean,
): Promise<void> {
  "use server";
  const actor = await requireActor();
  const target = await requireTarget(userId);
  assertMayAssign(actor, target.role, target.role);
  if (banned) {
    assertNotSelf(actor, target, "ban");
    await auth.api.banUser({
      body: { userId, banReason: "Banned by an administrator" },
      headers: actor.headers,
    });
  } else {
    await auth.api.unbanUser({ body: { userId }, headers: actor.headers });
  }
}

/**
 * Clears a user's authenticator and backup codes so they can enrol a new device,
 * and revokes their sessions so a session opened with the lost factor ends too.
 */
export async function resetUserTwoFactor(userId: string): Promise<void> {
  "use server";
  const actor = await requireActor();
  const target = await requireTarget(userId);
  assertMayAssign(actor, target.role, target.role);
  // Your own factor is managed from account settings, where you prove who you are.
  assertNotSelf(actor, target, "reset two-factor authentication for");

  await prisma.$transaction([
    prisma.twoFactor.deleteMany({ where: { userId } }),
    prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: false },
    }),
  ]);
  await auth.api.revokeUserSessions({
    body: { userId },
    headers: actor.headers,
  });
}

export async function deleteUser(userId: string): Promise<void> {
  "use server";
  const actor = await requireActor();
  const target = await requireTarget(userId);
  assertMayAssign(actor, target.role, target.role);
  assertNotSelf(actor, target, "delete");
  await auth.api.removeUser({ body: { userId }, headers: actor.headers });
}
