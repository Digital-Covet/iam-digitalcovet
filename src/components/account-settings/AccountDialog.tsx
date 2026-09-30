import { Dialog } from "@ark-ui/solid/dialog";
import { Portal } from "solid-js/web";
import type { Component, JSX } from "solid-js";
import { X } from "lucide-solid";

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: JSX.Element;
}

// Unmounting on exit gives each opening a fresh form, so a half-typed
// password never survives a close.
const AccountDialog: Component<AccountDialogProps> = (props) => (
  <Dialog.Root
    open={props.open}
    onOpenChange={(d) => props.onOpenChange(d.open)}
    lazyMount
    unmountOnExit
  >
    <Portal>
      <Dialog.Backdrop class="fixed inset-0 z-80 bg-black/50" />
      <Dialog.Positioner class="fixed inset-0 z-80 flex items-center justify-center p-4">
        <Dialog.Content class="max-h-full w-full max-w-md overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-xl">
          <div class="mb-5 flex items-start justify-between gap-4">
            <div>
              <Dialog.Title class="text-lg font-semibold text-foreground">
                {props.title}
              </Dialog.Title>
              <Dialog.Description class="mt-1 text-sm text-muted-foreground">
                {props.description}
              </Dialog.Description>
            </div>
            <Dialog.CloseTrigger
              aria-label="Close dialog"
              class="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <X size={18} aria-hidden="true" />
            </Dialog.CloseTrigger>
          </div>
          {props.children}
        </Dialog.Content>
      </Dialog.Positioner>
    </Portal>
  </Dialog.Root>
);

export default AccountDialog;
