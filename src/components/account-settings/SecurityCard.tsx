import type { Component } from "solid-js";
import { Show, createSignal } from "solid-js";
import { Shield, Key, CheckCircle, Lock } from "lucide-solid";
import type { AccountSecurity } from "@/types";
import AccountDialog from "./AccountDialog";
import BackupCodesForm from "./BackupCodesForm";
import ChangePasswordForm from "./ChangePasswordForm";
import TwoFactorSetupDialog from "./TwoFactorSetupDialog";
import { smallSecondaryButtonClass } from "./styles";

type SecurityDialog = "password" | "twoFactor" | "backupCodes";

interface SecurityCardProps {
  security: AccountSecurity;
  onChanged: () => void;
}

function describePasswordAge(changedAt: string | null): string {
  if (!changedAt) return "No password set";
  const date = new Date(changedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  return `Last changed ${date}`;
}

function describeBackupCodes(security: AccountSecurity): string {
  if (!security.twoFactorEnabled) return "Available after enabling 2FA";
  const remaining = security.backupCodesRemaining;
  if (remaining === null) return "Not available";
  return `${remaining} code${remaining === 1 ? "" : "s"} remaining`;
}

const SecurityCard: Component<SecurityCardProps> = (props) => {
  const [openDialog, setOpenDialog] = createSignal<SecurityDialog | null>(null);
  const [resetting, setResetting] = createSignal(false);

  const isOpen = (dialog: SecurityDialog) => openDialog() === dialog;
  const toggleFor = (dialog: SecurityDialog) => (open: boolean) =>
    setOpenDialog(open ? dialog : null);

  const openTwoFactorSetup = () => {
    setResetting(props.security.twoFactorEnabled);
    setOpenDialog("twoFactor");
  };

  const closeAndRefresh = () => {
    setOpenDialog(null);
    props.onChanged();
  };

  return (
    <div class="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div class="mb-4 flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
          <Shield size={20} aria-hidden="true" class="text-primary" />
        </div>
        <h2 class="font-heading text-lg font-semibold text-foreground">
          Security Settings
        </h2>
      </div>

      <div class="space-y-4">
        <div class="rounded-lg border border-border bg-background p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <Key size={18} aria-hidden="true" class="text-muted-foreground" />
              <div>
                <p class="text-sm font-medium text-foreground">Password</p>
                <p class="text-xs text-muted-foreground">
                  {describePasswordAge(props.security.passwordChangedAt)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpenDialog("password")}
              class={smallSecondaryButtonClass}
            >
              Change Password
            </button>
          </div>
        </div>

        <div class="rounded-lg border border-border bg-background p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <Lock size={18} aria-hidden="true" class="text-muted-foreground" />
              <div>
                <p class="text-sm font-medium text-foreground">Two-Factor Authentication</p>
                <p class="text-xs text-muted-foreground">
                  {props.security.twoFactorEnabled
                    ? "Enabled - Required for your account"
                    : "Required - Must be enabled"}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <Show when={props.security.twoFactorEnabled}>
                <CheckCircle size={18} aria-hidden="true" class="text-green-500" />
                <span class="text-xs font-medium text-green-600">Enabled</span>
                <button
                  type="button"
                  onClick={openTwoFactorSetup}
                  class={smallSecondaryButtonClass}
                >
                  Reset 2FA
                </button>
              </Show>
              <Show when={!props.security.twoFactorEnabled}>
                <button
                  type="button"
                  onClick={openTwoFactorSetup}
                  class="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  Enable 2FA
                </button>
              </Show>
            </div>
          </div>
        </div>

        <div class="rounded-lg border border-border bg-background p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <Shield size={18} aria-hidden="true" class="text-muted-foreground" />
              <div>
                <p class="text-sm font-medium text-foreground">Backup Codes</p>
                <p class="text-xs text-muted-foreground">{describeBackupCodes(props.security)}</p>
              </div>
            </div>
            <Show when={props.security.backupCodesRemaining !== null}>
              <button
                type="button"
                onClick={() => setOpenDialog("backupCodes")}
                class={smallSecondaryButtonClass}
              >
                View Codes
              </button>
            </Show>
          </div>
        </div>
      </div>

      <AccountDialog
        open={isOpen("password")}
        onOpenChange={toggleFor("password")}
        title="Change password"
        description="Choose a new password that meets your organization's policy."
      >
        <ChangePasswordForm onChanged={closeAndRefresh} />
      </AccountDialog>

      <TwoFactorSetupDialog
        open={isOpen("twoFactor")}
        onOpenChange={toggleFor("twoFactor")}
        reset={resetting()}
        onTwoFactorChange={props.onChanged}
      />

      <AccountDialog
        open={isOpen("backupCodes")}
        onOpenChange={toggleFor("backupCodes")}
        title="Backup codes"
        description="Use a backup code to sign in when your authenticator app is unavailable."
      >
        <BackupCodesForm onRegenerated={props.onChanged} />
      </AccountDialog>
    </div>
  );
};

export default SecurityCard;
