import { createToaster, Toast, Toaster } from "@ark-ui/solid/toast";
import X from "lucide-solid/icons/x";

export const toaster = createToaster({
  placement: "bottom-end",
  overlap: true,
  gap: 12,
});

export function AuthToaster() {
  return (
    <Toaster toaster={toaster}>
      {(toast) => (
        <Toast.Root class="w-[320px] rounded-lg border border-border bg-surface-raised p-4 text-foreground shadow-xl">
          <Toast.Title class="text-sm font-medium">{toast().title}</Toast.Title>
          <Toast.Description class="mt-1 text-xs text-foreground-muted">
            {toast().description}
          </Toast.Description>
          <Toast.CloseTrigger
            aria-label="Dismiss notification"
            class="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded text-foreground-muted hover:text-foreground"
          >
            <X size={14} stroke-width={1.75} />
          </Toast.CloseTrigger>
        </Toast.Root>
      )}
    </Toaster>
  );
}
