import { For, Show } from "solid-js";
import { Card } from "@/components/ui/card";
import type { RowAction } from "@/components/user-directory/user-actions";
import {
  AppAccessIcons,
  IdentityCell,
  RoleBadge,
  UserStatusPill,
} from "@/components/user-directory/user-cells";
import { UserRowMenu } from "@/components/user-directory/user-row-menu";
import { formatDate } from "@/lib/format-date";
import { DIRECTORY_TOUR_TARGETS } from "@/lib/tour-steps";
import type { DirectoryActor } from "@/lib/user-directory";
import type { DirectoryUser } from "@/types";

const HEAD_CELL =
  "px-4 py-2 text-left text-[11px] font-medium uppercase tracking-[0.08em] text-foreground-muted";
const WIDE_ONLY = "hidden md:table-cell";

interface UserTableProps {
  users: DirectoryUser[];
  actor: DirectoryActor;
  hasActiveFilters: boolean;
  onAction: (action: RowAction, user: DirectoryUser) => void;
  onClearFilters: () => void;
}

function EmptyState(props: {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}) {
  return (
    <div class="px-4 py-12 text-center text-sm text-foreground-muted">
      <p>
        {props.hasActiveFilters
          ? "No identities match filter criteria."
          : "No users have been added yet."}
      </p>
      <Show when={props.hasActiveFilters}>
        <button
          type="button"
          onClick={props.onClearFilters}
          class="mt-2 font-medium text-primary underline-offset-2 hover:underline dark:text-red-400"
        >
          Clear all filters
        </button>
      </Show>
    </div>
  );
}

function UserRow(props: {
  user: DirectoryUser;
  actor: DirectoryActor;
  onAction: UserTableProps["onAction"];
}) {
  return (
    <tr class="h-11 border-t border-border-subtle transition-colors hover:bg-primary/5">
      <td class="max-w-[280px] px-4">
        <button
          type="button"
          onClick={() => props.onAction("edit", props.user)}
          class="block w-full rounded focus-visible:outline-2 focus-visible:outline-ring"
        >
          <IdentityCell user={props.user} />
        </button>
      </td>
      <td class={`px-4 ${WIDE_ONLY}`}>
        <RoleBadge role={props.user.role} />
      </td>
      <td class={`px-4 ${WIDE_ONLY}`}>
        <AppAccessIcons apps={props.user.appAccess} />
      </td>
      <td class="px-4">
        <UserStatusPill user={props.user} />
      </td>
      <td
        class={`whitespace-nowrap px-4 font-mono text-xs tabular-nums text-foreground-muted ${WIDE_ONLY}`}
      >
        {formatDate(props.user.createdAt)}
      </td>
      <td class="px-4 text-right">
        <UserRowMenu
          user={props.user}
          actor={props.actor}
          onAction={props.onAction}
        />
      </td>
    </tr>
  );
}

export function UserTable(props: UserTableProps) {
  return (
    <Card>
      <Show
        when={props.users.length > 0}
        fallback={
          <EmptyState
            hasActiveFilters={props.hasActiveFilters}
            onClearFilters={props.onClearFilters}
          />
        }
      >
        <div class="overflow-x-auto" data-tour={DIRECTORY_TOUR_TARGETS.table}>
          <table class="w-full border-collapse">
            <thead>
              <tr>
                <th class={HEAD_CELL}>User</th>
                <th class={`${HEAD_CELL} ${WIDE_ONLY}`}>Role</th>
                <th class={`${HEAD_CELL} ${WIDE_ONLY}`}>App Access</th>
                <th class={HEAD_CELL}>Status</th>
                <th class={`${HEAD_CELL} ${WIDE_ONLY}`}>Created</th>
                <th class={`${HEAD_CELL} text-right`}>
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <For each={props.users}>
                {(user) => (
                  <UserRow
                    user={user}
                    actor={props.actor}
                    onAction={props.onAction}
                  />
                )}
              </For>
            </tbody>
          </table>
        </div>
      </Show>
    </Card>
  );
}
