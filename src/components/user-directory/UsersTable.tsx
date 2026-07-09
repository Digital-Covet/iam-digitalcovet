import { createSignal, For } from "solid-js";
import type { Component } from "solid-js";
import { ListFilter } from "lucide-solid";
import type { DirectoryUser } from "@/types";
import UserRow from "./UserRow";
import Pagination from "./Pagination";

const columns = ["User", "Roles", "2FA Status", "App Access", "Actions"];

interface UsersTableProps {
  users: DirectoryUser[];
  onEdit: (user: DirectoryUser) => void;
  onDisable: (user: DirectoryUser) => void;
  onEnable: (user: DirectoryUser) => void;
  onDelete: (user: DirectoryUser) => void;
}

const PAGE_SIZE = 5;

const UsersTable: Component<UsersTableProps> = (props) => {
  const [page, setPage] = createSignal(1);
  const totalPages = () => Math.ceil(props.users.length / PAGE_SIZE);
  const paginatedUsers = () => {
    const start = (page() - 1) * PAGE_SIZE;
    return props.users.slice(start, start + PAGE_SIZE);
  };

  return (
    <div class="overflow-hidden rounded-xl border border-border bg-card shadow-[0_4px_6px_-1px_rgb(0,0,0,0.05)]">
      <div class="flex items-center justify-between border-b border-border p-4">
        <h2 class="text-base font-semibold text-foreground">Directory List</h2>
        <button
          type="button"
          aria-label="Filter directory list"
          class="rounded p-1 text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <ListFilter size={14} aria-hidden="true" />
        </button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-200 border-collapse text-left text-sm">
          <thead>
            <tr class="border-b border-border bg-muted text-xs uppercase tracking-wider text-muted-foreground">
              <For each={columns}>
                {(column, index) => (
                  <th
                    scope="col"
                    class="px-4 py-2 font-medium"
                    classList={{ "text-right": index() === columns.length - 1 }}
                  >
                    {column}
                  </th>
                )}
              </For>
            </tr>
          </thead>
          <tbody class="divide-y divide-border text-foreground">
            <For each={paginatedUsers()}>
              {(user) => (
                <UserRow
                  user={user}
                  onEdit={props.onEdit}
                  onDisable={props.onDisable}
                  onEnable={props.onEnable}
                  onDelete={props.onDelete}
                />
              )}
            </For>
          </tbody>
        </table>
      </div>
      <Pagination
        count={props.users.length}
        page={page()}
        onPageChange={(p) => setPage(Math.min(p, totalPages()))}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
};

export default UsersTable;
