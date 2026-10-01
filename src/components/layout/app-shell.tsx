import { useLocation } from "@solidjs/router";
import ChevronRight from "lucide-solid/icons/chevron-right";
import Menu from "lucide-solid/icons/menu";
import { createSignal, type JSX, Show } from "solid-js";
import { BrandMark } from "@/components/layout/brand-mark";
import { ImpersonationBanner } from "@/components/layout/impersonation-banner";
import { MobileNavDrawer } from "@/components/layout/mobile-nav-drawer";
import { SidebarContent } from "@/components/layout/sidebar-content";
import { authClient } from "@/lib/auth-client";

export function AppShell(props: { children: JSX.Element }) {
  const location = useLocation();
  const session = authClient.useSession();
  const [collapsed, setCollapsed] = createSignal(false);
  const [mobileOpen, setMobileOpen] = createSignal(false);

  const impersonatedEmail = () => {
    const data = session().data;
    const impersonated = (
      data?.session as { impersonatedBy?: string | null } | undefined
    )?.impersonatedBy;
    return impersonated ? data?.user.email : undefined;
  };

  return (
    <div class="flex h-screen flex-col bg-background font-sans text-foreground antialiased">
      <Show when={impersonatedEmail()}>
        {(email) => <ImpersonationBanner email={email()} />}
      </Show>

      <div class="flex flex-1 overflow-hidden">
        <aside
          class="z-30 hidden flex-col border-r border-border bg-sidebar transition-[width] duration-200 ease-standard md:flex"
          classList={{ "w-[240px]": !collapsed(), "w-[60px]": collapsed() }}
        >
          <div class="flex h-[52px] items-center justify-between border-b border-border px-4">
            <BrandMark showLabel={!collapsed()} />
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed())}
              aria-label="Toggle navigation width"
              class="rounded p-1 text-foreground-muted transition-colors hover:bg-surface hover:text-foreground"
              classList={{ hidden: collapsed() }}
            >
              <ChevronRight size={16} class="rotate-180" />
            </button>
          </div>
          <Show when={collapsed()}>
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              aria-label="Expand navigation"
              class="mx-auto mt-2 rounded p-1 text-foreground-muted hover:bg-surface hover:text-foreground"
            >
              <ChevronRight size={16} />
            </button>
          </Show>
          <SidebarContent
            currentPath={location.pathname}
            collapsed={collapsed()}
          />
        </aside>

        <main class="flex min-w-0 flex-1 flex-col overflow-y-auto">
          <header class="flex h-[52px] shrink-0 items-center justify-between border-b border-border bg-sidebar px-4 md:hidden">
            <BrandMark showLabel />
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
              class="flex h-10 w-10 items-center justify-center"
            >
              <Menu size={20} />
            </button>
          </header>
          <div class="mx-auto w-full max-w-[1440px] flex-1 p-4 md:p-6">
            {props.children}
          </div>
        </main>
      </div>

      <MobileNavDrawer
        open={mobileOpen()}
        currentPath={location.pathname}
        onOpenChange={setMobileOpen}
      />
    </div>
  );
}
