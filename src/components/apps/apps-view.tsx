import { For, Show } from "solid-js";
import { AppCard } from "@/components/apps/app-card";
import { LogoutEndpointsCard } from "@/components/apps/logout-endpoints-card";
import { PageHeader } from "@/components/ui/page-header";
import type { ConnectedAppsData } from "@/types";

export function AppsView(props: { data: ConnectedAppsData }) {
  return (
    <>
      <PageHeader
        title="Connected Applications"
        subtitle="Single sign-on targets and OAuth2/OIDC client resource configurations"
      />
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <For each={props.data.apps}>{(app) => <AppCard app={app} />}</For>
      </div>
      <Show when={props.data.isAdmin}>
        <div class="mt-6">
          <LogoutEndpointsCard endpoints={props.data.logoutEndpoints} />
        </div>
      </Show>
    </>
  );
}
