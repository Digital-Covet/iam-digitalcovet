import type { Component } from "solid-js";
import { createEffect, onCleanup, For } from "solid-js";
import { X } from "lucide-solid";
import { primaryNavItems } from "@/data";
import SidebarNavItem from "./SidebarNavItem";
import SignOutButton from "./auth/sign-out-button";

interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
}

const MobileNavDrawer: Component<MobileNavDrawerProps> = (props) => {
  let drawerRef: HTMLDivElement | undefined;
  let previousActiveElement: Element | null = null;

  createEffect(() => {
    if (props.open) {
      previousActiveElement = document.activeElement;
      document.body.style.overflow = "hidden";
      const id = requestAnimationFrame(() => drawerRef?.focus());
      onCleanup(() => cancelAnimationFrame(id));
    } else {
      document.body.style.overflow = "";
      if (previousActiveElement instanceof HTMLElement) {
        previousActiveElement.focus();
      }
    }
  });

  onCleanup(() => {
    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
    }
  });

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      props.onClose();
      return;
    }
    if (e.key === "Tab" && drawerRef) {
      const focusable = drawerRef.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      class={`fixed inset-0 z-60 md:hidden ${props.open ? "" : "pointer-events-none"}`}
    >
      {/* Blurred dark backdrop — clearly separates drawer from the page */}
      <div
        class={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${props.open ? "opacity-100" : "opacity-0"
          }`}
        onClick={props.onClose}
        aria-hidden="true"
      />

      {/* Floating drawer panel — inset from all edges, rounded, elevated */}
      <div
        ref={drawerRef}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        class={`absolute bottom-3 left-3 top-3 flex w-[min(280px,calc(100vw-4rem))] flex-col rounded-2xl border border-sidebar-border bg-sidebar shadow-2xl transition-transform duration-300 ease-in-out focus:outline-none ${props.open ? "translate-x-0" : "-translate-x-[calc(100%+1rem)]"
          }`}
      >
        {/* Drawer header */}
        <div class="flex items-center justify-between border-b border-sidebar-border p-4">
          <span class="text-sm font-semibold tracking-tight text-sidebar-foreground">
            Menu
          </span>
          <button
            type="button"
            aria-label="Close navigation menu"
            class="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            onClick={props.onClose}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Mobile navigation" class="flex-1 overflow-y-auto p-3">
          <div class="space-y-1">
            <For each={primaryNavItems}>
              {(item) => <SidebarNavItem item={item} onNavigate={props.onClose} />}
            </For>
          </div>
        </nav>

        <div class="border-t border-sidebar-border p-3">
          <SignOutButton
            class="flex w-full items-center gap-4 rounded-md px-4 py-2 text-xs font-medium tracking-wide text-sidebar-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            showIcon
            onBeforeSignOut={props.onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default MobileNavDrawer;
