import { Meta, Title } from "@solidjs/meta";
import { createAsync } from "@solidjs/router";
import { Show, Suspense } from "solid-js";
import {
  ACCOUNT_SETTINGS_SUBTITLE,
  ACCOUNT_SETTINGS_TITLE,
  AccountSettingsView,
} from "@/components/account-settings/account-settings-view";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { getAccountSettings } from "@/lib/account-settings";
import { pageMetadata } from "@/lib/seo";

export const route = {
  preload: () => getAccountSettings(),
};

export default function AccountSettingsPage() {
  const data = createAsync(() => getAccountSettings());

  return (
    <>
      <Title>{pageMetadata.accountSettings.title}</Title>
      <Meta
        name="description"
        content={pageMetadata.accountSettings.description}
      />
      <AppShell>
        <Suspense
          fallback={
            <PageHeader
              title={ACCOUNT_SETTINGS_TITLE}
              subtitle={ACCOUNT_SETTINGS_SUBTITLE}
            />
          }
        >
          <Show
            when={data()}
            fallback={
              <p class="rounded-lg border border-border bg-surface p-6 text-sm text-foreground-muted">
                Your account could not be loaded. Sign in again to continue.
              </p>
            }
          >
            {(loaded) => <AccountSettingsView data={loaded()} />}
          </Show>
        </Suspense>
      </AppShell>
    </>
  );
}
