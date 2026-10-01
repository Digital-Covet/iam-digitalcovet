import { revalidate } from "@solidjs/router";
import { createMemo, createSignal, For, type JSX } from "solid-js";
import { PolicyField } from "@/components/auth-settings/policy-fields";
import { PolicyTester } from "@/components/auth-settings/policy-tester";
import { toaster } from "@/components/auth/auth-toaster";
import { Card, CardHeader } from "@/components/ui/card";
import { BUTTON_OUTLINE, BUTTON_PRIMARY, PageHeader } from "@/components/ui/page-header";
import { getAuthPolicies, saveAuthPolicies } from "@/lib/auth-policies";
import {
  definitionsInGroup,
  POLICY_DEFINITIONS,
  type PolicyGroup,
  type PolicyKey,
  type PolicyValue,
  type PolicyValues,
} from "@/lib/auth-policy-definitions";

const GROUP_TITLES: Record<PolicyGroup, string> = {
  password: "Password Complexity Requirements",
  lockout: "Account Lockout & Brute-Force Defense",
};

function changedKeys(saved: PolicyValues, draft: PolicyValues): PolicyKey[] {
  return POLICY_DEFINITIONS.map((d) => d.key).filter((key) => saved[key] !== draft[key]);
}

function PolicyGroupCard(props: {
  group: PolicyGroup;
  draft: PolicyValues;
  onChange: (key: PolicyKey, value: PolicyValue) => void;
  children?: JSX.Element;
}) {
  return (
    <Card>
      <CardHeader title={GROUP_TITLES[props.group]} />
      <div class="divide-y divide-border-subtle px-4">
        <For each={definitionsInGroup(props.group)}>
          {(definition) => (
            <PolicyField
              definition={definition}
              value={props.draft[definition.key]}
              onChange={(value) => props.onChange(definition.key, value)}
            />
          )}
        </For>
      </div>
      {props.children}
    </Card>
  );
}

export function AuthSettingsView(props: { policies: PolicyValues }) {
  const [saved, setSaved] = createSignal(props.policies);
  const [draft, setDraft] = createSignal(props.policies);
  const [saving, setSaving] = createSignal(false);
  const dirtyKeys = createMemo(() => changedKeys(saved(), draft()));
  const isDirty = () => dirtyKeys().length > 0;

  const updateDraft = (key: PolicyKey, value: PolicyValue) => setDraft((current) => ({ ...current, [key]: value }));

  async function save() {
    const submitted = draft();
    const changes = Object.fromEntries(dirtyKeys().map((key) => [key, submitted[key]]));
    setSaving(true);
    try {
      await saveAuthPolicies(changes);
      setSaved(submitted);
      await revalidate(getAuthPolicies.key);
      toaster.create({ title: "Policies saved", description: "New thresholds apply from the next sign-in.", type: "success" });
    } catch (error) {
      toaster.create({
        title: "Could not save policies",
        description: error instanceof Error ? error.message : "Try again in a moment.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Authentication & Password Policies"
        subtitle="Configure organizational credentials standards and account lockout heuristics"
        actions={
          <>
            <button type="button" class={`${BUTTON_OUTLINE} disabled:opacity-50`} disabled={!isDirty() || saving()} onClick={() => setDraft(saved())}>
              Discard
            </button>
            <button type="button" class={`${BUTTON_PRIMARY} disabled:opacity-50`} disabled={!isDirty() || saving()} onClick={save}>
              {saving() ? "Saving…" : "Save Policy Changes"}
            </button>
          </>
        }
      />
      <p class="mb-4 font-mono text-xs text-foreground-muted" aria-live="polite">
        {isDirty() ? `${dirtyKeys().length} unsaved ${dirtyKeys().length === 1 ? "change" : "changes"}` : "No unsaved policy modifications"}
      </p>
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PolicyGroupCard group="password" draft={draft()} onChange={updateDraft} />
        <PolicyGroupCard group="lockout" draft={draft()} onChange={updateDraft}>
          <div class="px-4 pb-4">
            <PolicyTester policies={draft()} />
          </div>
        </PolicyGroupCard>
      </div>
    </>
  );
}
