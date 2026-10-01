import { Dialog } from "@ark-ui/solid/dialog";
import X from "lucide-solid/icons/x";
import { Portal } from "solid-js/web";
import { BrandMark } from "@/components/layout/brand-mark";
import { SidebarContent } from "@/components/layout/sidebar-content";

interface MobileNavDrawerProps {
  open: boolean;
  currentPath: string;
  onOpenChange: (open: boolean) => void;
}

export function MobileNavDrawer(props: MobileNavDrawerProps) {
  return (
    <Dialog.Root open={props.open} onOpenChange={(event) => props.onOpenChange(event.open)} lazyMount unmountOnExit>
      <Portal>
        <Dialog.Backdrop class="fixed inset-0 z-40 bg-black/50" />
        <Dialog.Positioner class="fixed inset-y-0 left-0 z-50 flex">
          <Dialog.Content class="flex h-full w-[260px] flex-col border-r border-border bg-sidebar shadow-xl">
            <div class="flex h-[52px] items-center justify-between border-b border-border px-4">
              <Dialog.Title class="sr-only">Navigation</Dialog.Title>
              <BrandMark showLabel />
              <Dialog.CloseTrigger
                aria-label="Close navigation"
                class="flex h-10 w-10 items-center justify-center text-foreground-muted hover:text-foreground"
              >
                <X size={18} stroke-width={1.75} />
              </Dialog.CloseTrigger>
            </div>
            <SidebarContent
              currentPath={props.currentPath}
              collapsed={false}
              onNavigate={() => props.onOpenChange(false)}
            />
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
