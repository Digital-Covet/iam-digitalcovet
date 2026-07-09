import type { Component } from "solid-js";
import { Show } from "solid-js";
import { Shield, Key, CheckCircle, Lock } from "lucide-solid";

interface SecurityCardProps {
  twoFactorEnabled: boolean;
  userId: string;
}

const SecurityCard: Component<SecurityCardProps> = (props) => {
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
                <p class="text-xs text-muted-foreground">Last changed 30 days ago</p>
              </div>
            </div>
            <button
              type="button"
              class="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
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
                  {props.twoFactorEnabled
                    ? "Enabled - Required for your account"
                    : "Required - Must be enabled"}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <Show when={props.twoFactorEnabled}>
                <CheckCircle size={18} aria-hidden="true" class="text-green-500" />
                <span class="text-xs font-medium text-green-600">Enabled</span>
              </Show>
              <Show when={!props.twoFactorEnabled}>
                <button
                  type="button"
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
                <p class="text-xs text-muted-foreground">
                  {props.twoFactorEnabled ? "8 codes remaining" : "Available after enabling 2FA"}
                </p>
              </div>
            </div>
            <Show when={props.twoFactorEnabled}>
              <button
                type="button"
                class="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                View Codes
              </button>
            </Show>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityCard;
