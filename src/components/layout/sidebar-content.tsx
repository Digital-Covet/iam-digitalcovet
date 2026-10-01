import { For, Show } from "solid-js";
import { AccountMenu } from "@/components/layout/account-menu";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { navTourId } from "@/lib/tour-steps";

interface SidebarContentProps {
  currentPath: string;
  collapsed: boolean;
  onNavigate?: () => void;
}

function isActive(currentPath: string, href: string) {
  return href === "/" ? currentPath === "/" : currentPath.startsWith(href);
}
function NavList(props: SidebarContentProps) {
  return (
    <nav
      class="flex-1 space-y-1 overflow-y-auto px-2 py-3"
      aria-label="Primary"
    >
      <Show when={!props.collapsed}>
        <p class="px-2.5 pb-1 text-[11px] font-medium uppercase tracking-[0.08em] text-foreground-muted">
          Identity &amp; Governance
        </p>
      </Show>
      <For each={NAV_ITEMS}>
        {(item) => {
          const active = () => isActive(props.currentPath, item.href);
          return (
            <a
              href={item.href}
              data-tour={navTourId(item.href)}
              onClick={props.onNavigate}
              aria-current={active() ? "page" : undefined}
              title={props.collapsed ? item.label : undefined}
              class="relative flex items-center gap-3 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors duration-[120ms] focus-visible:outline-2 focus-visible:outline-ring"
              classList={{
                "bg-primary/10 font-semibold text-foreground": active(),
                "text-foreground-muted hover:bg-surface hover:text-foreground":
                  !active(),
              }}
            >
              <Show when={active()}>
                <span class="absolute inset-y-1.5 left-0 w-[3px] rounded-r bg-primary" />
              </Show>
              <item.icon
                size={16}
                stroke-width={1.75}
                classList={{ "text-[#f87171]": active() }}
              />
              <Show when={!props.collapsed}>
                <span class="flex-1 truncate">{item.label}</span>
              </Show>
            </a>
          );
        }}
      </For>
    </nav>
  );
}

export function SidebarContent(props: SidebarContentProps) {
  return (
    <>
      <NavList {...props} />
      <AccountMenu {...props} />
    </>
  );
}
