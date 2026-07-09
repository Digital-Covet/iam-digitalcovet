import { Avatar } from "@ark-ui/solid/avatar";
import { Menu } from "@ark-ui/solid/menu";
import type { Component } from "solid-js";
import { EllipsisVertical } from "lucide-solid";
import type { AvatarTone, DirectoryUser } from "@/types";
import RoleBadge from "./RoleBadge";
import MfaStatusIndicator from "./MfaStatusIndicator";
import AppAccessIcons from "./AppAccessIcons";

const avatarToneClasses: Record<AvatarTone, string> = {
  primary: "bg-primary text-primary-foreground",
  neutral: "bg-muted text-muted-foreground",
};

interface UserRowProps {
  user: DirectoryUser;
  onEdit: (user: DirectoryUser) => void;
  onDisable: (user: DirectoryUser) => void;
  onEnable: (user: DirectoryUser) => void;
  onDelete: (user: DirectoryUser) => void;
}

const UserRow: Component<UserRowProps> = (props) => (
  <tr
    class="h-12 transition-colors hover:bg-muted/50"
    classList={{ "bg-destructive/5": props.user.banned }}
  >
    <td class="px-4 py-2">
      <div class="flex items-center">
        <Avatar.Root
          aria-hidden="true"
          class={`mr-2 h-8 w-8 shrink-0 rounded-full text-xs font-bold ${avatarToneClasses[props.user.avatarTone]}`}
        >
          <Avatar.Fallback class="flex h-full w-full items-center justify-center">
            {props.user.initials}
          </Avatar.Fallback>
        </Avatar.Root>
        <div>
          <div class="flex items-center gap-2">
            <span class="font-medium">{props.user.name}</span>
            {props.user.banned && (
              <span class="inline-flex items-center rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-destructive">
                Banned
              </span>
            )}
          </div>
          <div class="text-xs text-muted-foreground">{props.user.email}</div>
        </div>
      </div>
    </td>
    <td class="px-4 py-2">
      <RoleBadge role={props.user.role} />
    </td>
    <td class="px-4 py-2">
      <MfaStatusIndicator status={props.user.mfaStatus} />
    </td>
    <td class="px-4 py-2">
      <AppAccessIcons access={props.user.appAccess} />
    </td>
    <td class="px-4 py-2 text-right">
      <Menu.Root>
        <Menu.Trigger
          aria-label={`Actions for ${props.user.name}`}
          class="rounded p-1 text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <EllipsisVertical size={14} aria-hidden="true" />
        </Menu.Trigger>
        <Menu.Positioner>
          <Menu.Content class="min-w-36 origin-top-right rounded-md border bg-popover p-1 shadow-md transition-all duration-150 data-[state=closed]:scale-95 data-[state=closed]:opacity-0 data-[state=open]:scale-100 data-[state=open]:opacity-100">
            <Menu.Item
              value="edit"
              onSelect={() => props.onEdit(props.user)}
              class="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
            >
              Edit
            </Menu.Item>
            <Menu.Item
              value="ban"
              onSelect={() => (props.user.banned ? props.onEnable(props.user) : props.onDisable(props.user))}
              class="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
            >
              {props.user.banned ? "Unban" : "Ban"}
            </Menu.Item>
            <Menu.Separator class="my-1 h-px bg-border" />
            <Menu.Item
              value="delete"
              onSelect={() => props.onDelete(props.user)}
              class="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-destructive data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive"
            >
              Delete
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Menu.Root>
    </td>
  </tr>
);

export default UserRow;
