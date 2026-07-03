import type { Component } from "solid-js";
import { createSignal, createMemo, For, Show } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { Search } from "lucide-solid";
import type { Role } from "@/types";
import RoleListItem from "./RoleListItem";
import PermissionCheckbox from "./PermissionCheckbox";

interface RolesAccessPanelProps {
  roles: Role[];
}

const RolesAccessPanel: Component<RolesAccessPanelProps> = (props) => {
  // Local editable copy of roles (permission toggles mutate this store).
  const [roles, setRoles] = createStore<Role[]>(
    structuredClone(props.roles)
  );
  const [selectedId, setSelectedId] = createSignal(roles[0]?.id ?? "");
  const [query, setQuery] = createSignal("");

  const filteredRoles = createMemo(() => {
    const q = query().trim().toLowerCase();
    if (!q) return roles;
    return roles.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.summary.toLowerCase().includes(q)
    );
  });

  const selectedRole = createMemo(() =>
    roles.find((r) => r.id === selectedId())
  );

  const isReadOnly = createMemo(() => selectedRole()?.name === "SuperAdmin");

  const togglePermission = (sectionId: string, permId: string, granted: boolean) => {
    setRoles(
      produce((draft) => {
        const role = draft.find((r) => r.id === selectedId());
        const perm = role?.sections
          .find((s) => s.id === sectionId)
          ?.permissions.find((p) => p.id === permId);
        if (perm) perm.granted = granted;
        // TODO: persist via API — out of scope here.
      })
    );
  };

  return (
    <div class="flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm md:flex-row">
      {/* ── Left pane: role list ─────────────────────────── */}
      <div class="flex w-full shrink-0 flex-col border-b border-border md:w-[30%] md:border-b-0 md:border-r">
        <div class="border-b border-border p-4">
          <div class="relative">
            <label for="role-search" class="sr-only">Search roles</label>
            <Search
              size={16}
              aria-hidden="true"
              class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              id="role-search"
              type="text"
              placeholder="Search roles..."
              value={query()}
              onInput={(e) => setQuery(e.currentTarget.value)}
              class="w-full rounded-md border border-input bg-muted py-2 pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
        <div
          role="tablist"
          aria-label="Roles"
          aria-orientation="vertical"
          class="flex-1 overflow-y-auto py-2"
        >
          <For each={filteredRoles()}>
            {(role) => (
              <RoleListItem
                role={role}
                selected={role.id === selectedId()}
                onSelect={setSelectedId}
              />
            )}
          </For>
          <Show when={filteredRoles().length === 0}>
            <p class="px-4 py-6 text-sm text-muted-foreground">
              No roles match "{query()}".
            </p>
          </Show>
        </div>
      </div>

      {/* ── Right pane: details & permissions ────────────── */}
      <div
        id="role-detail-panel"
        role="tabpanel"
        aria-labelledby={`role-tab-${selectedId()}`}
        class="flex w-full flex-col md:w-[70%]"
      >
        <Show
          when={selectedRole()}
          fallback={
            <p class="p-6 text-sm text-muted-foreground">Select a role to view its permissions.</p>
          }
        >
          {(role) => (
            <>
              {/* Detail header */}
              <div class="flex shrink-0 flex-col items-start justify-between gap-4 border-b border-border p-6 sm:flex-row sm:items-center">
                <div>
                  <div class="mb-1 flex items-center gap-2">
                    <h2 class="text-xl font-semibold text-foreground">{role().name}</h2>
                    <Show when={role().isCustom}>
                      <span class="rounded bg-accent px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-accent-foreground">
                        Custom Role
                      </span>
                    </Show>
                  </div>
                  <p class="text-sm text-muted-foreground">{role().description}</p>
                </div>
                <Show when={!isReadOnly()}>
                  <button
                    type="button"
                    class="rounded-md border border-border px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    Edit Details
                  </button>
                </Show>
              </div>

              {/* Permissions matrix */}
              <div class="flex-1 space-y-8 overflow-y-auto p-6">
                <For each={role().sections}>
                  {(section) => (
                    <section aria-labelledby={`perm-section-${section.id}`}>
                      <h3
                        id={`perm-section-${section.id}`}
                        class="mb-4 border-b border-border pb-1 text-sm font-semibold text-foreground"
                      >
                        {section.title}
                      </h3>
                      <div class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                        <For each={section.permissions}>
                          {(perm) => (
                            <PermissionCheckbox
                              label={perm.label}
                              checked={perm.granted}
                              disabled={isReadOnly()}
                              onChange={(checked) =>
                                togglePermission(section.id, perm.id, checked)
                              }
                            />
                          )}
                        </For>
                      </div>
                    </section>
                  )}
                </For>
              </div>
            </>
          )}
        </Show>
      </div>
    </div>
  );
};

export default RolesAccessPanel;
