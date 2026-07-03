import type { Component } from "solid-js";
import { For } from "solid-js";
import { footerNavItems, primaryNavItems } from "@/data";
import SidebarNavItem from "./SidebarNavItem";

const Sidebar: Component = () => (
  <nav
    aria-label="Main navigation"
    class="sticky top-4 hidden h-[calc(100vh-8.5rem)] w-64 shrink-0 flex-col self-start rounded-xl border border-sidebar-border bg-background p-3 shadow-sm md:flex"
  >
    <div class="flex-1 space-y-1 overflow-y-auto">
      <For each={primaryNavItems}>{(item) => <SidebarNavItem item={item} />}</For>
    </div>
    <div class="mt-auto space-y-1 border-t border-sidebar-border pt-3">
      <For each={footerNavItems}>{(item) => <SidebarNavItem item={item} />}</For>
    </div>
  </nav>
);
export default Sidebar;
