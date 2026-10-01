import LoaderCircle from "lucide-solid/icons/loader-circle";
import { createSignal, Show } from "solid-js";
import { messageOf, refreshAccount } from "@/components/account-settings/action-error";
import { toaster } from "@/components/auth/auth-toaster";
import { Card, CardHeader } from "@/components/ui/card";
import { BUTTON_PRIMARY } from "@/components/ui/page-header";
import { LABEL_CLASS } from "@/components/ui/password-field";
import { TextField } from "@/components/ui/text-field";
import { AppAvatar } from "@/components/ui/avatar";
import { formatDate } from "@/lib/format-date";
import { updateOwnName } from "@/lib/account-settings";
import type { UserProfile } from "@/types";

function Avatar(props: { profile: UserProfile }) {
  return (
    <AppAvatar
      initials={props.profile.initials}
      src={props.profile.avatarUrl}
      label={props.profile.name}
      size="lg"
    />
  );
}

function ReadOnlyFact(props: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt class={LABEL_CLASS}>{props.label}</dt>
      <dd class={`mt-1 text-[13.5px] ${props.mono ? "font-mono text-xs" : ""}`}>{props.value}</dd>
    </div>
  );
}

export function ProfileCard(props: { profile: UserProfile }) {
  const [name, setName] = createSignal(props.profile.name);
  const [saving, setSaving] = createSignal(false);
  const canSave = () => !saving() && name().trim().length > 0 && name().trim() !== props.profile.name;

  async function save(event: SubmitEvent) {
    event.preventDefault();
    if (!canSave()) return;
    setSaving(true);
    try {
      await updateOwnName(name());
      await refreshAccount();
      toaster.create({ title: "Profile updated", description: "Your display name was saved.", type: "success" });
    } catch (error) {
      toaster.create({ title: "Could not save profile", description: messageOf(error, "Try again in a moment."), type: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader title="Profile" />
      <div class="space-y-5 p-4">
        <div class="flex items-center gap-4">
          <Avatar profile={props.profile} />
          <div class="min-w-0">
            <p class="truncate text-[15px] font-medium">{props.profile.name}</p>
            <p class="truncate font-mono text-xs text-foreground-muted">{props.profile.email}</p>
          </div>
        </div>

        <form onSubmit={save} class="space-y-1.5">
          <div class="flex items-end gap-2">
            <div class="min-w-0 flex-1">
              <TextField
                id="display-name"
                label="Display Name"
                autocomplete="name"
                maxLength={100}
                value={name()}
                onInput={setName}
              />
            </div>
            <button type="submit" disabled={!canSave()} class={`${BUTTON_PRIMARY} h-10 shrink-0 disabled:cursor-not-allowed disabled:opacity-60`}>
              <Show when={saving()}>
                <LoaderCircle size={16} stroke-width={1.75} class="animate-spin" />
              </Show>
              {saving() ? "Saving…" : "Save"}
            </button>
          </div>
        </form>

        <dl class="grid grid-cols-2 gap-4 border-t border-border pt-4">
          <ReadOnlyFact label="Role" value={props.profile.role} />
          <ReadOnlyFact label="Department" value={props.profile.department ?? "Not assigned"} />
          <ReadOnlyFact label="Member Since" value={formatDate(props.profile.createdAt)} mono />
          <ReadOnlyFact label="Email" value={props.profile.email} mono />
        </dl>
      </div>
    </Card>
  );
}
