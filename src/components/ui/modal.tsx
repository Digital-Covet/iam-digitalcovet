import { Dialog } from "@ark-ui/solid/dialog";
import X from "lucide-solid/icons/x";
import type { JSX } from "solid-js";
import { Portal } from "solid-js/web";

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  onOpenChange: (open: boolean) => void;
  children: JSX.Element;
}

/** Content mounts only while open, so state inside a modal resets on every reopen. */
export function Modal(props: ModalProps) {
  return (
    <Dialog.Root
      open={props.open}
      onOpenChange={(event) => props.onOpenChange(event.open)}
      closeOnInteractOutside={false}
      lazyMount
      unmountOnExit
    >
      <Portal>
        <Dialog.Backdrop class="fixed inset-0 z-40 bg-black/50" />
        <Dialog.Positioner class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Dialog.Content class="w-full max-w-[440px] rounded-lg border border-border bg-surface-raised p-6 shadow-xl">
            <div class="mb-4 flex items-start justify-between gap-3">
              <div>
                <Dialog.Title class="font-heading text-lg font-bold tracking-[-0.01em]">
                  {props.title}
                </Dialog.Title>
                {props.description && (
                  <Dialog.Description class="mt-1 text-[13px] text-foreground-muted">
                    {props.description}
                  </Dialog.Description>
                )}
              </div>
              <Dialog.CloseTrigger
                aria-label="Close dialog"
                class="-mr-2 -mt-2 flex h-8 w-8 shrink-0 items-center justify-center rounded text-foreground-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
              >
                <X size={16} stroke-width={1.75} />
              </Dialog.CloseTrigger>
            </div>
            {props.children}
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
