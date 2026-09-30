import type { Component } from "solid-js";
import { Suspense, createSignal } from "solid-js";
import { createAsync } from "@solidjs/router";
import { authToaster } from "@/components/auth/auth-toaster";
import PasswordRequirements from "@/components/auth/PasswordRequirements";
import { authClient } from "@/lib/auth-client";
import { getPasswordPolicies } from "@/lib/password-policies";
import { validatePassword } from "@/lib/password-validation";
import { createAccountAction, unwrapAuthResult } from "./account-action";
import FormError from "./FormError";
import PasswordField from "./PasswordField";
import { primaryButtonClass } from "./styles";

const ChangePasswordForm: Component<{ onChanged: () => void }> = (props) => {
  const policies = createAsync(() => getPasswordPolicies());
  const [currentPassword, setCurrentPassword] = createSignal("");
  const [newPassword, setNewPassword] = createSignal("");
  const [confirmPassword, setConfirmPassword] = createSignal("");
  const [signOutOthers, setSignOutOthers] = createSignal(true);
  const { pending, error, run } = createAccountAction();

  const changePassword = async () => {
    if (newPassword() !== confirmPassword()) {
      throw new Error("New passwords do not match.");
    }
    if (!validatePassword(newPassword(), policies() ?? []).valid) {
      throw new Error("New password does not meet the password policy.");
    }
    await unwrapAuthResult(
      authClient.changePassword({
        currentPassword: currentPassword(),
        newPassword: newPassword(),
        revokeOtherSessions: signOutOthers(),
      }),
    );
  };

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    if (await run(changePassword)) {
      authToaster.create({ title: "Password changed.", type: "success" });
      props.onChanged();
    }
  };

  return (
    <form onSubmit={handleSubmit} class="space-y-4">
      <PasswordField label="Current password" autoComplete="current-password" onInput={setCurrentPassword} />
      <PasswordField label="New password" autoComplete="new-password" onInput={setNewPassword} />
      <PasswordField label="Confirm new password" autoComplete="new-password" onInput={setConfirmPassword} />
      <Suspense>
        <PasswordRequirements password={newPassword()} policies={policies() ?? []} />
      </Suspense>
      <label class="flex cursor-pointer items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          class="h-4 w-4 accent-primary"
          checked={signOutOthers()}
          onChange={(e) => setSignOutOthers(e.currentTarget.checked)}
        />
        Sign out of all other sessions
      </label>
      <FormError message={error()} />
      <button type="submit" disabled={pending()} class={`${primaryButtonClass} w-full`}>
        {pending() ? "Changing..." : "Change password"}
      </button>
    </form>
  );
};

export default ChangePasswordForm;
