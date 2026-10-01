import { Dialog } from "@ark-ui/solid/dialog";
import X from "lucide-solid/icons/x";
import type { JSX } from "solid-js";
import { Portal } from "solid-js/web";

interface DrawerProps {
  open: boolean;
  title: string;
  description?: string;
  onOpenChange: (open: boolean) => void;
  children: JSX.Element;
}

/** Right-hand slide-over that keeps the page beneath it visible. Content mounts only while open. */
export function Drawer(props: DrawerProps) {
  return (
    <Dialog.Root open={props.open} onOpenChange={(event) => props.onOpenChange(event.open)} lazyMount unmountOnExit>
      <Portal>
        <Dialog.Backdrop class="drawer-backdrop fixed inset-0 z-40 bg-black/40" />
        <Dialog.Positioner class="fixed inset-0 z-50 flex justify-end">
          <Dialog.Content class="drawer-content flex h-full w-full max-w-[480px] flex-col border-l border-border bg-surface-raised shadow-2xl">
            <header class="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
              <div class="min-w-0">
                <Dialog.Title class="truncate font-heading text-lg font-bold tracking-[-0.01em]">{props.title}</Dialog.Title>
                {props.description && (
                  <Dialog.Description class="mt-1 text-[13px] text-foreground-muted">{props.description}</Dialog.Description>
                )}
              </div>
              <Dialog.CloseTrigger
                aria-label="Close drawer"
                class="-mr-2 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded text-foreground-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
              >
                <X size={16} stroke-width={1.75} />
              </Dialog.CloseTrigger>
            </header>
            <div class="flex-1 overflow-y-auto px-5 py-4">{props.children}</div>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
