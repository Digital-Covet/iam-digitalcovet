import { revalidate } from "@solidjs/router";
import Download from "lucide-solid/icons/download";
import Plus from "lucide-solid/icons/plus";
import { createMemo, createSignal, Show } from "solid-js";
import {
  messageOf,
  unwrapClientResult,
} from "@/components/account-settings/action-error";
import { toaster } from "@/components/auth/auth-toaster";
import {
  BUTTON_OUTLINE,
  BUTTON_PRIMARY,
  PageHeader,
} from "@/components/ui/page-header";
import {
  ConfirmActionModal,
  type PendingConfirmation,
} from "@/components/user-directory/confirm-action-modal";
import {
  CONFIRMATIONS,
  type RowAction,
} from "@/components/user-directory/user-actions";
import { UserFilterBar } from "@/components/user-directory/user-filter-bar";
import {
  type UserEditorTarget,
  UserFormDrawer,
} from "@/components/user-directory/user-form-drawer";
import { UserStatStrip } from "@/components/user-directory/user-stat-strip";
import { UserTable } from "@/components/user-directory/user-table";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/lib/constants";
import { downloadTextFile } from "@/lib/download";
import { toRoleLabel } from "@/lib/roles";
import {
  buildDirectoryStats,
  type DirectoryActor,
  EMPTY_FILTERS,
  filterUsers,
  hasActiveFilters,
  toUsersCsv,
} from "@/lib/user-directory";
import {
  getDirectoryUsers,
  inviteUser,
  setUserBanned,
  updateUser,
} from "@/lib/users";
import type { DirectoryUser, UserDraft, UserFilters } from "@/types";

const INVITE_TARGET: UserEditorTarget = { user: null };

function useActor(): () => DirectoryActor | null {
  const session = authClient.useSession();
  return () => {
    const user = session().data?.user;
    return user
      ? { id: user.id, role: toRoleLabel((user as { role?: string }).role) }
      : null;
  };
}

async function impersonate(user: DirectoryUser) {
  unwrapClientResult(
    await authClient.admin.impersonateUser({ userId: user.id }),
    "Unable to impersonate this user.",
  );
  window.location.assign(ROUTES.DASHBOARD);
}

export function UserDirectoryView(props: { users: DirectoryUser[] }) {
  const actor = useActor();
  const [filters, setFilters] = createSignal<UserFilters>(EMPTY_FILTERS);
  const [editor, setEditor] = createSignal<UserEditorTarget | null>(null);
  const [confirming, setConfirming] = createSignal<PendingConfirmation | null>(
    null,
  );

  const visible = createMemo(() => filterUsers(props.users, filters()));
  const stats = createMemo(() => buildDirectoryStats(props.users));

  async function reportOutcome(
    task: () => Promise<void>,
    success: string,
  ): Promise<void> {
    try {
      await task();
      await revalidate(getDirectoryUsers.key);
      toaster.create({ title: success, type: "success" });
    } catch (failure) {
      toaster.create({
        title: "Action failed",
        description: messageOf(failure, "Try again in a moment."),
        type: "error",
      });
    }
  }

  async function saveUser(draft: UserDraft) {
    const target = editor()?.user;
    await (target ? updateUser(target.id, draft) : inviteUser(draft));
    await revalidate(getDirectoryUsers.key);
    toaster.create({
      title: target ? "User updated" : "Invitation sent",
      description: draft.email,
      type: "success",
    });
    setEditor(null);
  }

  async function runConfirmed(pending: PendingConfirmation) {
    const config = CONFIRMATIONS[pending.action];
    await reportOutcome(() => config.run(pending.user.id), config.success);
    setConfirming(null);
  }

  function handleAction(action: RowAction, user: DirectoryUser) {
    if (action === "edit") return setEditor({ user });
    if (action === "impersonate")
      return void reportOutcome(
        () => impersonate(user),
        "Impersonation started",
      );
    if (action === "unban")
      return void reportOutcome(
        () => setUserBanned(user.id, false),
        "Access restored",
      );
    setConfirming({ action, user });
  }

  const exportCsv = () =>
    downloadTextFile(toUsersCsv(visible()), "text/csv", "user-directory.csv");

  return (
    <>
      <PageHeader
        title="User Directory"
        subtitle="Manage enterprise accounts, invitations, and ecosystem entitlements"
        actions={
          <>
            <button type="button" class={BUTTON_OUTLINE} onClick={exportCsv}>
              <Download size={16} stroke-width={1.75} />
              Export CSV
            </button>
            <button
              type="button"
              class={BUTTON_PRIMARY}
              onClick={() => setEditor(INVITE_TARGET)}
            >
              <Plus size={16} stroke-width={1.75} />
              Invite Employee
            </button>
          </>
        }
      />
      <UserStatStrip stats={stats()} />
      <UserFilterBar
        filters={filters()}
        shown={visible().length}
        total={props.users.length}
        onChange={(patch) =>
          setFilters((current) => ({ ...current, ...patch }))
        }
      />
      <Show when={actor()}>
        {(current) => (
          <UserTable
            users={visible()}
            actor={current()}
            hasActiveFilters={hasActiveFilters(filters())}
            onAction={handleAction}
            onClearFilters={() => setFilters(EMPTY_FILTERS)}
          />
        )}
      </Show>
      <Show when={actor()}>
        {(current) => (
          <UserFormDrawer
            open={editor() !== null}
            target={editor() ?? INVITE_TARGET}
            actor={current()}
            onClose={() => setEditor(null)}
            onSubmit={saveUser}
          />
        )}
      </Show>
      <ConfirmActionModal
        pending={confirming()}
        onCancel={() => setConfirming(null)}
        onConfirm={runConfirmed}
      />
    </>
  );
}
