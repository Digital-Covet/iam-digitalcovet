import { Meta, Title } from "@solidjs/meta";
import { createAsync } from "@solidjs/router";
import { Show, Suspense } from "solid-js";
import { AuthSettingsView } from "@/components/auth-settings/auth-settings-view";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { getAuthPolicies } from "@/lib/auth-policies";
import { pageMetadata } from "@/lib/seo";

export const route = {
  preload: () => getAuthPolicies(),
};

export default function AuthSettingsPage() {
  const policies = createAsync(() => getAuthPolicies());

  return (
    <>
      <Title>{pageMetadata.authSettings.title}</Title>
      <Meta
        name="description"
        content={pageMetadata.authSettings.description}
      />
      <AppShell>
        <Suspense
          fallback={
            <PageHeader
              title="Authentication & Password Policies"
              subtitle="Configure organizational credentials standards and account lockout heuristics"
            />
          }
        >
          <Show
            when={policies()}
            fallback={
              <p class="rounded-lg border border-border bg-surface p-6 text-sm text-foreground-muted">
                Authentication policies are available to administrators only.
              </p>
            }
          >
            {(loaded) => <AuthSettingsView policies={loaded()} />}
          </Show>
        </Suspense>
      </AppShell>
    </>
  );
}
