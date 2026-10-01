import { ChangePasswordCard } from "@/components/account-settings/change-password-card";
import { ProfileCard } from "@/components/account-settings/profile-card";
import { SessionsCard } from "@/components/account-settings/sessions-card";
import { TwoFactorCard } from "@/components/account-settings/two-factor-card";
import { PageHeader } from "@/components/ui/page-header";
import type { AccountSettingsData } from "@/types";

export const ACCOUNT_SETTINGS_TITLE = "Account Settings";
export const ACCOUNT_SETTINGS_SUBTITLE = "Manage your profile, password, two-factor authentication, and signed-in devices";

export function AccountSettingsView(props: { data: AccountSettingsData }) {
  return (
    <>
      <PageHeader title={ACCOUNT_SETTINGS_TITLE} subtitle={ACCOUNT_SETTINGS_SUBTITLE} />
      <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <div class="space-y-6">
          <ProfileCard profile={props.data.user} />
          <TwoFactorCard security={props.data.security} />
        </div>
        <div class="space-y-6">
          <ChangePasswordCard passwordChangedAt={props.data.security.passwordChangedAt} />
          <SessionsCard sessions={props.data.sessions} />
        </div>
      </div>
    </>
  );
}
