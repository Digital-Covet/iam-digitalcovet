import type { Component } from "solid-js";
import { Show, Suspense } from "solid-js";
import { createAsync, revalidate, type RouteDefinition } from "@solidjs/router";
import { Settings } from "lucide-solid";
import AppLayout from "@/components/AppLayout";
import AuthGuard from "@/components/auth/auth-guard";
import { AuthToaster } from "@/components/auth/auth-toaster";
import ProfileCard from "@/components/account-settings/ProfileCard";
import SecurityCard from "@/components/account-settings/SecurityCard";
import ActiveSessionsList from "@/components/account-settings/ActiveSessionsList";
import { getAccountSettings } from "@/lib/account-settings";
import { getPasswordPolicies } from "@/lib/password-policies";

export const route = {
  preload: () => Promise.all([getAccountSettings(), getPasswordPolicies()]),
} satisfies RouteDefinition;

const AccountSettingsPage: Component = () => {
  const account = createAsync(() => getAccountSettings());
  const refresh = () => void revalidate(getAccountSettings.key);

  return (
    <AuthGuard>
      <AppLayout>
        <div class="mb-6">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
              <Settings size={22} aria-hidden="true" class="text-primary" />
            </div>
            <div>
              <h1 class="font-heading text-2xl font-semibold tracking-tight text-foreground md:text-[2rem] md:leading-10">
                Account Settings
              </h1>
              <p class="mt-1 text-sm text-muted-foreground">
                Manage your profile, security preferences, and active sessions.
              </p>
            </div>
          </div>
        </div>

        <Suspense fallback={<div class="text-muted-foreground">Loading...</div>}>
          <Show
            when={account()}
            fallback={<div class="text-muted-foreground">Unable to load account data.</div>}
          >
            {(data) => (
              <>
                <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <ProfileCard user={data().user} onChanged={refresh} />
                  <SecurityCard security={data().security} onChanged={refresh} />
                </div>

                <div class="mt-6">
                  <ActiveSessionsList sessions={data().sessions} onChanged={refresh} />
                </div>
              </>
            )}
          </Show>
        </Suspense>
        <AuthToaster />
      </AppLayout>
    </AuthGuard>
  );
};

export default AccountSettingsPage;
