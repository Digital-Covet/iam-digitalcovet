import type { Component } from "solid-js";
import { For } from "solid-js";
import { primaryNavItems } from "@/data";
import SidebarNavItem from "./SidebarNavItem";
import SignOutButton from "./auth/sign-out-button";

const Sidebar: Component = () => (
  <nav
    aria-label="Main navigation"
    class="sticky top-4 hidden h-[calc(100vh-8.5rem)] w-64 shrink-0 flex-col self-start rounded-xl border border-sidebar-border bg-background p-3 shadow-sm md:flex"
  >
    <div class="flex-1 space-y-1 overflow-y-auto">
      <For each={primaryNavItems}>{(item) => <SidebarNavItem item={item} />}</For>
    </div>
    <div class="mt-auto border-t border-sidebar-border pt-3">
      <SignOutButton
        class="flex w-full items-center gap-4 rounded-md px-4 py-2 text-xs font-medium tracking-wide text-sidebar-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        showIcon
      />
    </div>
  </nav>
);
export default Sidebar;
