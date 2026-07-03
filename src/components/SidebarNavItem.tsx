import type { Component } from "solid-js";
import { useLocation } from "@solidjs/router";
import type { NavItem } from "@/types";

const SidebarNavItem: Component<{ item: NavItem; onNavigate?: () => void }> = (props) => {
  const location = useLocation();
  const isActive = () => location.pathname === props.item.href;
  return (
    <a
      href={props.item.href}
      aria-current={isActive() ? "page" : undefined}
      onClick={() => props.onNavigate?.()}
      class="flex items-center gap-4 rounded-md px-4 py-2 text-xs font-medium tracking-wide transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      classList={{
        "bg-sidebar-accent text-sidebar-accent-foreground font-semibold": isActive(),
        "text-sidebar-foreground hover:bg-muted": !isActive(),
      }}
    >
    <props.item.icon size={20} aria-hidden="true" />
    <span>{props.item.label}</span>
  </a>
  );
};

export default SidebarNavItem;
