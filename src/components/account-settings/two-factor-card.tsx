import KeyRound from "lucide-solid/icons/key-round";
import RefreshCw from "lucide-solid/icons/refresh-cw";
import ShieldCheck from "lucide-solid/icons/shield-check";
import Smartphone from "lucide-solid/icons/smartphone";
import { createSignal, For, Show } from "solid-js";
import {
  refreshAccount,
  unwrapClientResult,
} from "@/components/account-settings/action-error";
import { BackupCodeList } from "@/components/account-settings/backup-code-list";
import { PasswordConfirmDialog } from "@/components/account-settings/password-confirm-dialog";
import {
  type SetupMode,
  TwoFactorSetupDialog,
} from "@/components/account-settings/two-factor-setup-dialog";
import { toaster } from "@/components/auth/auth-toaster";
import { Card, CardHeader } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { BUTTON_OUTLINE, BUTTON_PRIMARY } from "@/components/ui/page-header";
import { StatusPill } from "@/components/ui/status-pill";
import { revealBackupCodes } from "@/lib/account-settings";
import { authClient } from "@/lib/auth-client";
import type { AccountSecurity } from "@/types";

type ConfirmFlow = "view-codes" | "regenerate";
type Flow = SetupMode | ConfirmFlow;

interface ConfirmConfig {
  title: string;
  description: string;
  confirmLabel: string;
  run: (password: string) => Promise<string[]>;
}

const CONFIRM_FLOWS: Record<ConfirmFlow, ConfirmConfig> = {
  "view-codes": {
    title: "View Backup Codes",
    description: "Confirm your password to reveal your remaining backup codes.",
    confirmLabel: "Reveal Codes",
    run: revealBackupCodes,
  },
  regenerate: {
    title: "Regenerate Backup Codes",
    description:
      "This invalidates every existing backup code and issues a new set.",
    confirmLabel: "Regenerate",
    run: async (password) =>
      unwrapClientResult(
        await authClient.twoFactor.generateBackupCodes({ password }),
        "Unable to regenerate backup codes.",
      ).backupCodes,
  },
};

const isConfirmFlow = (flow: Flow | null): flow is ConfirmFlow =>
  flow !== null && flow in CONFIRM_FLOWS;

function ActionRow(props: {
  icon: typeof KeyRound;
  label: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={props.onClick}
        class="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-[120ms] hover:bg-surface-raised focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
      >
        <props.icon
          size={16}
          stroke-width={1.75}
          class="text-foreground-muted"
        />
        <span class="min-w-0">
          <span class="block text-[13.5px] font-medium">{props.label}</span>
          <span class="block text-xs text-foreground-muted">{props.hint}</span>
        </span>
      </button>
    </li>
  );
}

function backupCodeHint(remaining: number | null): string {
  if (remaining === null)
    return "Single-use codes for when your authenticator is unavailable";
  return `${remaining} unused ${remaining === 1 ? "code" : "codes"} remaining`;
}

export function TwoFactorCard(props: { security: AccountSecurity }) {
  const [flow, setFlow] = createSignal<Flow | null>(null);
  const [revealedCodes, setRevealedCodes] = createSignal<string[] | null>(null);

  const close = () => setFlow(null);
  const confirmConfig = () => {
    const current = flow();
    return isConfirmFlow(current) ? CONFIRM_FLOWS[current] : null;
  };
  const setupMode = (): SetupMode => (flow() === "reset" ? "reset" : "enable");

  async function finishSetup() {
    close();
    await refreshAccount();
    toaster.create({
      title: "Two-factor authentication is on",
      type: "success",
    });
  }

  async function runConfirmed(config: ConfirmConfig, password: string) {
    const codes = await config.run(password);
    close();
    await refreshAccount();
    setRevealedCodes(codes);
  }

  return (
    <Card>
      <CardHeader
        title="Two-Factor Authentication"
        aside={
          <StatusPill
            tone={props.security.twoFactorEnabled ? "success" : "warning"}
            label={
              props.security.twoFactorEnabled ? "Enrolled" : "Not enrolled"
            }
          />
        }
      />
      <Show
        when={props.security.twoFactorEnabled}
        fallback={
          <div class="space-y-4 p-4">
            <p class="text-[13px] text-foreground-muted">
              Add a second step to sign-in with a time-based code from an
              authenticator app. It is the strongest protection for your
              account, and your administrator may require it.
            </p>
            <button
              type="button"
              onClick={() => setFlow("enable")}
              class={BUTTON_PRIMARY}
            >
              <Smartphone size={16} stroke-width={1.75} />
              Set Up Authenticator
            </button>
          </div>
        }
      >
        <ul class="divide-y divide-border-subtle">
          <For
            each={
              [
                {
                  icon: RefreshCw,
                  label: "Reset authenticator",
                  hint: "Pair a new device and replace all backup codes",
                  flow: "reset",
                },
                {
                  icon: KeyRound,
                  label: "View backup codes",
                  hint: backupCodeHint(props.security.backupCodesRemaining),
                  flow: "view-codes",
                },
                {
                  icon: ShieldCheck,
                  label: "Regenerate backup codes",
                  hint: "Invalidate the current set and issue new ones",
                  flow: "regenerate",
                },
              ] as const
            }
          >
            {(action) => (
              <ActionRow
                icon={action.icon}
                label={action.label}
                hint={action.hint}
                onClick={() => setFlow(action.flow)}
              />
            )}
          </For>
        </ul>
      </Show>

      <TwoFactorSetupDialog
        open={flow() === "enable" || flow() === "reset"}
        mode={setupMode()}
        onOpenChange={(open) => !open && close()}
        onFinished={finishSetup}
      />
      <Show when={confirmConfig()}>
        {(config) => (
          <PasswordConfirmDialog
            open
            title={config().title}
            description={config().description}
            confirmLabel={config().confirmLabel}
            onConfirm={(password) => runConfirmed(config(), password)}
            onOpenChange={(open) => !open && close()}
          />
        )}
      </Show>
      <Modal
        open={revealedCodes() !== null}
        title="Backup Codes"
        description="Each code works once. Keep them somewhere only you can reach."
        onOpenChange={(open) => !open && setRevealedCodes(null)}
      >
        <div class="space-y-4">
          <BackupCodeList codes={revealedCodes() ?? []} />
          <button
            type="button"
            onClick={() => setRevealedCodes(null)}
            class={`${BUTTON_OUTLINE} w-full`}
          >
            Done
          </button>
        </div>
      </Modal>
    </Card>
  );
}
