import { Meta, Title } from "@solidjs/meta";
import { createAsync } from "@solidjs/router";
import { Show, Suspense } from "solid-js";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { UserDirectoryView } from "@/components/user-directory/user-directory-view";
import { pageMetadata } from "@/lib/seo";
import { getDirectoryUsers } from "@/lib/users";

export const route = {
  preload: () => getDirectoryUsers(),
};

export default function UserDirectoryPage() {
  const users = createAsync(() => getDirectoryUsers());

  return (
    <>
      <Title>{pageMetadata.users.title}</Title>
      <Meta name="description" content={pageMetadata.users.description} />
      <AppShell>
        <Suspense
          fallback={
            <PageHeader
              title="User Directory"
              subtitle="Manage enterprise accounts, invitations, and ecosystem entitlements"
            />
          }
        >
          <Show
            when={users()}
            fallback={
              <p class="rounded-lg border border-border bg-surface p-6 text-sm text-foreground-muted">
                The user directory is available to administrators only.
              </p>
            }
          >
            {(loaded) => <UserDirectoryView users={loaded()} />}
          </Show>
        </Suspense>
      </AppShell>
    </>
  );
}
