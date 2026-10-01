import { Menu } from "@ark-ui/solid/menu";
import Ellipsis from "lucide-solid/icons/ellipsis";
import { For } from "solid-js";
import { Portal } from "solid-js/web";
import {
  availableActions,
  ROW_ACTIONS,
  type RowAction,
} from "@/components/user-directory/user-actions";
import type { DirectoryActor } from "@/lib/user-directory";
import type { DirectoryUser } from "@/types";

interface UserRowMenuProps {
  user: DirectoryUser;
  actor: DirectoryActor;
  onAction: (action: RowAction, user: DirectoryUser) => void;
}

export function UserRowMenu(props: UserRowMenuProps) {
  const actions = () => availableActions(props.user, props.actor);

  return (
    <Menu.Root
      onSelect={(details) =>
        props.onAction(details.value as RowAction, props.user)
      }
      positioning={{ placement: "bottom-end" }}
    >
      <Menu.Trigger
        aria-label={`Actions for ${props.user.name}`}
        disabled={actions().length === 0}
        class="inline-flex h-8 w-8 items-center justify-center rounded text-foreground-muted transition-colors duration-[120ms] hover:bg-surface-raised hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-40"
      >
        <Ellipsis size={16} stroke-width={1.75} />
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content class="z-50 min-w-[210px] rounded-lg border border-border bg-surface-raised p-1 shadow-xl focus:outline-none">
            <For each={actions()}>
              {(action) => {
                const definition = ROW_ACTIONS[action];
                return (
                  <Menu.Item
                    value={action}
                    class={`flex h-8 cursor-pointer items-center gap-2 rounded px-2 text-[13px] data-[highlighted]:bg-primary/10 ${
                      definition.danger
                        ? "text-red-800 dark:text-red-400"
                        : "text-foreground"
                    }`}
                  >
                    <definition.icon size={14} stroke-width={1.75} />
                    {definition.label}
                  </Menu.Item>
                );
              }}
            </For>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
