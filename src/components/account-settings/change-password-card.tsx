import { createAsync } from "@solidjs/router";
import LoaderCircle from "lucide-solid/icons/loader-circle";
import { createSignal, Show } from "solid-js";
import {
  messageOf,
  refreshAccount,
  unwrapClientResult,
} from "@/components/account-settings/action-error";
import { AuthErrorAlert } from "@/components/auth/auth-error-alert";
import { toaster } from "@/components/auth/auth-toaster";
import { PasswordPolicyChecklist } from "@/components/auth/password-policy-checklist";
import { Card, CardHeader } from "@/components/ui/card";
import { ArkCheckbox } from "@/components/ui/checkbox";
import { BUTTON_PRIMARY } from "@/components/ui/page-header";
import { PasswordField } from "@/components/ui/password-field";
import { TONE_TEXT } from "@/components/ui/status-tone";
import { authClient } from "@/lib/auth-client";
import { formatDate } from "@/lib/format-date";
import { getPasswordPolicies } from "@/lib/password-policies";
import { validatePassword } from "@/lib/password-validation";

export function ChangePasswordCard(props: {
  passwordChangedAt: string | null;
}) {
  const policies = createAsync(() => getPasswordPolicies());
  const [current, setCurrent] = createSignal("");
  const [next, setNext] = createSignal("");
  const [confirm, setConfirm] = createSignal("");
  const [signOutOthers, setSignOutOthers] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const [pending, setPending] = createSignal(false);

  const meetsPolicy = () => validatePassword(next(), policies() ?? []).valid;
  const mismatch = () => confirm().length > 0 && confirm() !== next();
  const canSubmit = () =>
    !pending() && current() !== "" && meetsPolicy() && next() === confirm();

  function clearFields() {
    setCurrent("");
    setNext("");
    setConfirm("");
  }

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    if (!canSubmit()) return;
    setError(null);
    setPending(true);
    try {
      unwrapClientResult(
        await authClient.changePassword({
          currentPassword: current(),
          newPassword: next(),
          revokeOtherSessions: signOutOthers(),
        }),
        "Unable to change your password.",
      );
      clearFields();
      await refreshAccount();
      toaster.create({
        title: "Password changed",
        description: signOutOthers()
          ? "Other devices were signed out."
          : "Your new password is active.",
        type: "success",
      });
    } catch (failure) {
      setError(messageOf(failure, "Unable to change your password."));
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader
        title="Change Password"
        aside={
          <span class="font-mono text-[11px] text-foreground-muted">
            {props.passwordChangedAt
              ? `Last changed ${formatDate(props.passwordChangedAt)}`
              : "No password set"}
          </span>
        }
      />
      <form onSubmit={submit} class="space-y-4 p-4" novalidate>
        <AuthErrorAlert message={error()} />
        <PasswordField
          id="current-password"
          label="Current Password"
          autocomplete="current-password"
          value={current()}
          onInput={setCurrent}
        />
        <PasswordField
          id="new-password"
          label="New Password"
          autocomplete="new-password"
          value={next()}
          onInput={setNext}
        />
        <PasswordPolicyChecklist password={next()} />
        <PasswordField
          id="confirm-password"
          label="Confirm New Password"
          autocomplete="new-password"
          value={confirm()}
          onInput={setConfirm}
        />
        <Show when={mismatch()}>
          <p role="alert" class={`text-xs ${TONE_TEXT.critical}`}>
            Passwords do not match.
          </p>
        </Show>

        <ArkCheckbox
          label="Sign out of all other devices"
          checked={signOutOthers()}
          onChange={setSignOutOthers}
        />

        <button
          type="submit"
          disabled={!canSubmit()}
          class={`${BUTTON_PRIMARY} w-full disabled:cursor-not-allowed disabled:opacity-60`}
        >
          <Show when={pending()}>
            <LoaderCircle size={16} stroke-width={1.75} class="animate-spin" />
          </Show>
          {pending() ? "Updating…" : "Update Password"}
        </button>
      </form>
    </Card>
  );
}
