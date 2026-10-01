import { Fieldset } from "@ark-ui/solid/fieldset";
import LoaderCircle from "lucide-solid/icons/loader-circle";
import { createMemo, createSignal, For, Show } from "solid-js";
import { messageOf } from "@/components/account-settings/action-error";
import { AuthErrorAlert } from "@/components/auth/auth-error-alert";
import { ArkCheckbox } from "@/components/ui/checkbox";
import { Drawer } from "@/components/ui/drawer";
import { FilterSelect } from "@/components/ui/filter-select";
import { BUTTON_OUTLINE, BUTTON_PRIMARY } from "@/components/ui/page-header";
import { LABEL_CLASS } from "@/components/ui/password-field";
import { TextField } from "@/components/ui/text-field";
import { ALL_APPS } from "@/lib/app-access";
import {
  type DirectoryActor,
  EMPTY_DRAFT,
  isElevatedRole,
  toDraft,
} from "@/lib/user-directory";
import type { AppAccess, DirectoryUser, UserDraft, UserRole } from "@/types";

const ASSIGNABLE_ROLES: readonly UserRole[] = [
  "Employee",
  "Admin",
  "SuperAdmin",
];

export interface UserEditorTarget {
  /** `null` invites a new user; a user edits that account. */
  user: DirectoryUser | null;
}

interface UserFormDrawerProps {
  open: boolean;
  target: UserEditorTarget;
  actor: DirectoryActor;
  onClose: () => void;
  onSubmit: (draft: UserDraft) => Promise<void>;
}

interface UserFormProps extends Omit<UserFormDrawerProps, "open"> {}

function UserForm(props: UserFormProps) {
  const [draft, setDraft] = createSignal<UserDraft>(
    props.target.user ? toDraft(props.target.user) : EMPTY_DRAFT,
  );
  const [error, setError] = createSignal<string | null>(null);
  const [pending, setPending] = createSignal(false);

  const patch = (change: Partial<UserDraft>) =>
    setDraft((current) => ({ ...current, ...change }));
  const isEditing = () => props.target.user !== null;
  const ownAccount = () => props.target.user?.id === props.actor.id;
  const roles = () =>
    ASSIGNABLE_ROLES.filter(
      (role) => role !== "SuperAdmin" || props.actor.role === "SuperAdmin",
    );
  const roleOptions = createMemo(() =>
    roles().map((role) => ({ value: role, label: role })),
  );
  const appsLocked = () => isElevatedRole(draft().role);
  const hasApp = (app: AppAccess) =>
    appsLocked() || draft().appAccess.includes(app);
  const canSubmit = () =>
    !pending() &&
    draft().firstName.trim() !== "" &&
    draft().email.trim() !== "";

  function toggleApp(app: AppAccess, granted: boolean) {
    patch({
      appAccess: granted
        ? [...draft().appAccess, app]
        : draft().appAccess.filter((existing) => existing !== app),
    });
  }

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    if (!canSubmit()) return;
    setError(null);
    setPending(true);
    try {
      await props.onSubmit(draft());
    } catch (failure) {
      setError(messageOf(failure, "Unable to save this user."));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} class="space-y-4" novalidate>
      <AuthErrorAlert message={error()} />
      <div class="grid grid-cols-2 gap-3">
        <TextField
          id="user-first-name"
          label="First Name"
          autocomplete="off"
          value={draft().firstName}
          onInput={(firstName) => patch({ firstName })}
        />
        <TextField
          id="user-last-name"
          label="Last Name"
          autocomplete="off"
          value={draft().lastName}
          onInput={(lastName) => patch({ lastName })}
        />
      </div>
      <TextField
        id="user-email"
        label="Email Address"
        type="email"
        autocomplete="off"
        value={draft().email}
        onInput={(email) => patch({ email })}
      />

      <div class="space-y-1.5">
        <span class={LABEL_CLASS} id="user-role-label">
          Role
        </span>
        <FilterSelect
          label="Role"
          value={draft().role}
          options={roleOptions()}
          disabled={ownAccount()}
          onChange={(role) => patch({ role: role as UserRole })}
        />
        <Show when={ownAccount()}>
          <p class="text-xs text-foreground-muted">
            You cannot change your own role.
          </p>
        </Show>
      </div>

      <Fieldset.Root class="space-y-2.5" disabled={appsLocked()}>
        <Fieldset.Legend class={`${LABEL_CLASS} mb-2`}>
          Application Access
        </Fieldset.Legend>
        <For each={ALL_APPS}>
          {(app) => (
            <ArkCheckbox
              label={app}
              checked={hasApp(app)}
              disabled={appsLocked()}
              onChange={(granted) => toggleApp(app, granted)}
            />
          )}
        </For>
        <Show when={appsLocked()}>
          <Fieldset.HelperText class="text-xs text-foreground-muted">
            Administrators can use every application.
          </Fieldset.HelperText>
        </Show>
      </Fieldset.Root>

      <Show when={!isEditing()}>
        <p class="rounded-md bg-surface p-3 text-xs text-foreground-muted">
          The invitee receives an email with a link to set their own password.
        </p>
      </Show>

      <div class="flex justify-end gap-2 border-t border-border pt-4">
        <button type="button" class={BUTTON_OUTLINE} onClick={props.onClose}>
          Cancel
        </button>
        <button
          type="submit"
          disabled={!canSubmit()}
          class={`${BUTTON_PRIMARY} disabled:cursor-not-allowed disabled:opacity-60`}
        >
          <Show when={pending()}>
            <LoaderCircle size={16} stroke-width={1.75} class="animate-spin" />
          </Show>
          {isEditing() ? "Save Changes" : "Send Invitation"}
        </button>
      </div>
    </form>
  );
}

export function UserFormDrawer(props: UserFormDrawerProps) {
  const editing = () => props.target.user;

  return (
    <Drawer
      open={props.open}
      title={editing()?.name ?? "Invite Employee"}
      description={
        editing()?.email ?? "Create an account and email a password setup link"
      }
      onOpenChange={(open) => !open && props.onClose()}
    >
      <UserForm
        target={props.target}
        actor={props.actor}
        onClose={props.onClose}
        onSubmit={props.onSubmit}
      />
    </Drawer>
  );
}
