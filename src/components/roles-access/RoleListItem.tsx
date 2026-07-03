import type { Component } from "solid-js";
import { ChevronRight } from "lucide-solid";
import type { Role } from "@/types";

interface RoleListItemProps {
  role: Role;
  selected: boolean;
  onSelect: (id: string) => void;
}

const RoleListItem: Component<RoleListItemProps> = (props) => (
  <button
    type="button"
    role="tab"
    aria-selected={props.selected}
    id={`role-tab-${props.role.id}`}
    aria-controls="role-detail-panel"
    onClick={() => props.onSelect(props.role.id)}
    class="group flex w-full items-center justify-between border-l-[3px] px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
    classList={{
      "border-primary bg-accent": props.selected,
      "border-transparent hover:bg-muted": !props.selected,
    }}
  >
    <span>
      <span
        class="block text-sm font-semibold"
        classList={{
          "text-primary": props.selected,
          "text-foreground": !props.selected,
        }}
      >
        {props.role.name}
      </span>
      <span class="block text-xs text-muted-foreground">{props.role.summary}</span>
    </span>
    <ChevronRight
      size={18}
      aria-hidden="true"
      class="shrink-0 transition-opacity"
      classList={{
        "text-primary opacity-100": props.selected,
        "text-muted-foreground opacity-0 group-hover:opacity-100": !props.selected,
      }}
    />
  </button>
);

export default RoleListItem;
