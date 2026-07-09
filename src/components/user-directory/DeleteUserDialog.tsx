import { Dialog } from "@ark-ui/solid/dialog";
import { Portal } from "solid-js/web";
import type { Component } from "solid-js";
import { AlertTriangle } from "lucide-solid";
import type { DirectoryUser } from "@/types";

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: DirectoryUser | null;
  onConfirm: () => void;
}

const DeleteUserDialog: Component<DeleteUserDialogProps> = (props) => (
  <Dialog.Root
    open={props.open}
    onOpenChange={(d) => props.onOpenChange(d.open)}
  >
    <Portal>
      <Dialog.Backdrop class="fixed inset-0 z-80 bg-black/50" />
      <Dialog.Positioner class="fixed inset-0 z-80 flex items-center justify-center p-4">
        <Dialog.Content class="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
          <div class="flex items-start gap-4">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle size={20} class="text-destructive" aria-hidden="true" />
            </div>
            <div class="flex-1">
              <Dialog.Title class="text-lg font-semibold text-foreground">
                Delete User
              </Dialog.Title>
              <Dialog.Description class="mt-2 text-sm text-muted-foreground">
                Are you sure you want to delete{" "}
                <span class="font-medium text-foreground">{props.user?.name}</span> (
                {props.user?.email})? This action cannot be undone and will permanently
                remove their account and all associated data.
              </Dialog.Description>
            </div>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <Dialog.CloseTrigger class="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
              Cancel
            </Dialog.CloseTrigger>
            <button
              type="button"
              onClick={props.onConfirm}
              class="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Delete User
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Positioner>
    </Portal>
  </Dialog.Root>
);

export default DeleteUserDialog;
