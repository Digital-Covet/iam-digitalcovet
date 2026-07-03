import { Drawer } from "@ark-ui/solid/drawer";
import { Switch } from "@ark-ui/solid/switch";
import { Portal } from "solid-js/web";
import type { Component } from "solid-js";
import { createSignal } from "solid-js";
import { X, Share2, Folder, ChevronDown } from "lucide-solid";

export interface InviteUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  shareAccess: boolean;
  portfolioAccess: boolean;
  role: string;
  requireMfa: boolean;
}

interface InviteUserDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (payload: InviteUserPayload) => void;
}

const inputClass =
  "w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-ring";

const AccessToggle: Component<{
  icon: typeof Share2;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = (props) => (
  <Switch.Root
    checked={props.checked}
    onCheckedChange={(d) => props.onChange(d.checked)}
    class="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-border bg-card p-4"
  >
    <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
      <props.icon size={20} aria-hidden="true" />
    </span>
    <Switch.Label class="flex-1">
      <span class="block text-sm font-semibold text-foreground">{props.title}</span>
      <span class="block text-xs text-muted-foreground">{props.description}</span>
    </Switch.Label>
    <Switch.Control class="relative h-6 w-11 shrink-0 rounded-full bg-border data-[state=checked]:bg-primary">
      <Switch.Thumb class="block h-5 w-5 translate-x-0.5 translate-y-0.5 rounded-full bg-white shadow-[0_1px_2px_0_rgb(0,0,0,0.05)] data-[state=checked]:translate-x-5.5" />
    </Switch.Control>
    <Switch.HiddenInput />
  </Switch.Root>
);

const InviteUserDrawer: Component<InviteUserDrawerProps> = (props) => {
  const [firstName, setFirstName] = createSignal("");
  const [lastName, setLastName] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [shareAccess, setShareAccess] = createSignal(true);
  const [portfolioAccess, setPortfolioAccess] = createSignal(false);
  const [role, setRole] = createSignal("");
  const [requireMfa, setRequireMfa] = createSignal(true);

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    props.onSubmit?.({
      firstName: firstName(),
      lastName: lastName(),
      email: email(),
      shareAccess: shareAccess(),
      portfolioAccess: portfolioAccess(),
      role: role(),
      requireMfa: requireMfa(),
    });
    props.onOpenChange(false);
  };

  return (
    <Drawer.Root
      open={props.open}
      onOpenChange={(d) => props.onOpenChange(d.open)}
      lazyMount
      unmountOnExit
    >
      <Portal>
        <Drawer.Backdrop class="drawer-backdrop fixed inset-0 z-70 bg-black/40" />
        <Drawer.Positioner class="fixed inset-y-0 right-0 z-70 flex w-full max-w-130">
          <Drawer.Content class="drawer-content flex h-full w-full flex-col bg-card shadow-2xl">
            {/* Header */}
            <div class="flex items-center justify-between border-b border-border px-6 py-5">
              <Drawer.Title class="text-xl font-semibold text-foreground">
                Invite New User
              </Drawer.Title>
              <Drawer.CloseTrigger
                aria-label="Close invite panel"
                class="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <X size={20} aria-hidden="true" />
              </Drawer.CloseTrigger>
            </div>

            {/* Body */}
            <form id="invite-user-form" onSubmit={handleSubmit} class="flex-1 space-y-6 overflow-y-auto px-6 py-6">
              {/* Names */}
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="invite-first-name" class="mb-1.5 block text-sm font-medium text-foreground">
                    First Name
                  </label>
                  <input
                    id="invite-first-name"
                    type="text"
                    required
                    placeholder="e.g. Sarah"
                    class={inputClass}
                    value={firstName()}
                    onInput={(e) => setFirstName(e.currentTarget.value)}
                  />
                </div>
                <div>
                  <label for="invite-last-name" class="mb-1.5 block text-sm font-medium text-foreground">
                    Last Name
                  </label>
                  <input
                    id="invite-last-name"
                    type="text"
                    required
                    placeholder="e.g. Jenkins"
                    class={inputClass}
                    value={lastName()}
                    onInput={(e) => setLastName(e.currentTarget.value)}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label for="invite-email" class="mb-1.5 block text-sm font-medium text-foreground">
                  Work Email Address
                </label>
                <input
                  id="invite-email"
                  type="email"
                  required
                  placeholder="s.jenkins@company.com"
                  class={inputClass}
                  value={email()}
                  onInput={(e) => setEmail(e.currentTarget.value)}
                />
              </div>

              {/* Provision Access */}
              <fieldset>
                <legend class="mb-3 text-base font-semibold text-foreground">
                  Provision Access
                </legend>
                <div class="space-y-3">
                  <AccessToggle
                    icon={Share2}
                    title="Share"
                    description="Secure File Sharing"
                    checked={shareAccess()}
                    onChange={setShareAccess}
                  />
                  <AccessToggle
                    icon={Folder}
                    title="Portfolio"
                    description="Multi-tenant Digital Portfolio"
                    checked={portfolioAccess()}
                    onChange={setPortfolioAccess}
                  />
                </div>
              </fieldset>

              {/* Role */}
              <div>
                <label for="invite-role" class="mb-1.5 block text-sm font-medium text-foreground">
                  Assign System Role
                </label>
                <div class="relative">
                  <select
                    id="invite-role"
                    required
                    class={`${inputClass} appearance-none pr-10 ${role() === "" ? "text-muted-foreground" : ""}`}
                    value={role()}
                    onChange={(e) => setRole(e.currentTarget.value)}
                  >
                    <option value="" disabled>
                      Select a role...
                    </option>
                    <option value="SuperAdmin">SuperAdmin</option>
                    <option value="Admin">Admin</option>
                    <option value="Employee">Employee</option>
                  </select>
                  <ChevronDown
                    size={16}
                    aria-hidden="true"
                    class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                </div>
                <p class="mt-1.5 text-xs text-muted-foreground">
                  Roles define permissions across all provisioned platforms.
                </p>
              </div>

              {/* 2FA */}
              <Switch.Root
                checked={requireMfa()}
                onCheckedChange={(d) => setRequireMfa(d.checked)}
                class="flex cursor-pointer items-center justify-between gap-4 pt-2"
              >
                <Switch.Label class="text-sm font-medium text-foreground">
                  Require Two-Factor Authentication (2FA) on initial login
                </Switch.Label>
                <Switch.Control class="relative h-6 w-11 shrink-0 rounded-full bg-border data-[state=checked]:bg-primary">
                  <Switch.Thumb class="block h-5 w-5 translate-x-0.5 translate-y-0.5 rounded-full bg-white shadow-[0_1px_2px_0_rgb(0,0,0,0.05)] data-[state=checked]:translate-x-5.5" />
                </Switch.Control>
                <Switch.HiddenInput />
              </Switch.Root>
            </form>

            {/* Footer */}
            <div class="grid grid-cols-2 gap-4 border-t border-border px-6 py-4">
              <Drawer.CloseTrigger class="rounded-md border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                Cancel
              </Drawer.CloseTrigger>
              <button
                type="submit"
                form="invite-user-form"
                class="rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Send Invite
              </button>
            </div>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
};

export default InviteUserDrawer;
