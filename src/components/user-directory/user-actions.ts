import Ban from "lucide-solid/icons/ban";
import Pencil from "lucide-solid/icons/pencil";
import RotateCcw from "lucide-solid/icons/rotate-ccw";
import ShieldOff from "lucide-solid/icons/shield-off";
import Trash2 from "lucide-solid/icons/trash";
import UserCheck from "lucide-solid/icons/user-check";
import {
  canManageUser,
  type DirectoryActor,
  isSelf,
} from "@/lib/user-directory";
import { deleteUser, resetUserTwoFactor, setUserBanned } from "@/lib/users";
import type { DirectoryUser, Icon } from "@/types";

export type RowAction =
  | "edit"
  | "impersonate"
  | "reset-2fa"
  | "ban"
  | "unban"
  | "delete";
export type ConfirmedAction = Extract<
  RowAction,
  "reset-2fa" | "ban" | "delete"
>;

interface RowActionDefinition {
  label: string;
  icon: Icon;
  danger?: boolean;
}

export const ROW_ACTIONS: Record<RowAction, RowActionDefinition> = {
  edit: { label: "Edit User & Entitlements", icon: Pencil },
  impersonate: { label: "Impersonate User", icon: UserCheck },
  "reset-2fa": { label: "Reset Two-Factor", icon: RotateCcw },
  ban: { label: "Suspend Access", icon: Ban, danger: true },
  unban: { label: "Restore Access", icon: ShieldOff },
  delete: { label: "Delete User", icon: Trash2, danger: true },
};

/** Self-targeting and cross-tier actions are hidden here and refused again by the server. */
export function availableActions(
  user: DirectoryUser,
  actor: DirectoryActor,
): RowAction[] {
  if (!canManageUser(actor, user)) return [];
  if (isSelf(actor, user)) return ["edit"];
  const actions: RowAction[] = ["edit"];
  if (!user.banned) actions.push("impersonate");
  if (user.mfaStatus === "Enabled") actions.push("reset-2fa");
  actions.push(user.banned ? "unban" : "ban", "delete");
  return actions;
}

interface Confirmation {
  title: string;
  describe: (user: DirectoryUser) => string;
  confirmLabel: string;
  success: string;
  run: (userId: string) => Promise<void>;
}

export const CONFIRMATIONS: Record<ConfirmedAction, Confirmation> = {
  "reset-2fa": {
    title: "Reset two-factor authentication?",
    describe: (user) =>
      `${user.name} will lose their authenticator and backup codes, be signed out everywhere, and must enrol a new device.`,
    confirmLabel: "Reset 2FA",
    success: "Two-factor reset",
    run: resetUserTwoFactor,
  },
  ban: {
    title: "Suspend this user?",
    describe: (user) =>
      `${user.name} will be signed out and unable to sign in to any Digital Covet app until restored.`,
    confirmLabel: "Suspend",
    success: "User suspended",
    run: (userId) => setUserBanned(userId, true),
  },
  delete: {
    title: "Delete this user?",
    describe: (user) =>
      `${user.email} and all of their sessions will be permanently removed. This cannot be undone.`,
    confirmLabel: "Delete user",
    success: "User deleted",
    run: deleteUser,
  },
};
