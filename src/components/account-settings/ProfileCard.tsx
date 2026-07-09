import type { Component } from "solid-js";
import { Show } from "solid-js";
import { User, Mail, Briefcase, Calendar } from "lucide-solid";
import type { UserProfile } from "@/types";

interface ProfileCardProps {
  user: UserProfile;
}

const ProfileCard: Component<ProfileCardProps> = (props) => {
  const formattedDate = () => {
    const date = new Date(props.user.createdAt);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div class="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div class="mb-4 flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
          <User size={20} aria-hidden="true" class="text-primary" />
        </div>
        <h2 class="font-heading text-lg font-semibold text-foreground">
          Profile Information
        </h2>
      </div>

      <div class="flex items-start gap-4">
        <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
          {props.user.initials}
        </div>
        <div class="min-w-0 flex-1 space-y-3">
          <div class="flex items-center gap-2 text-sm">
            <User size={16} aria-hidden="true" class="shrink-0 text-muted-foreground" />
            <span class="font-medium text-foreground">{props.user.name}</span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <Mail size={16} aria-hidden="true" class="shrink-0 text-muted-foreground" />
            <span class="text-muted-foreground">{props.user.email}</span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <Briefcase size={16} aria-hidden="true" class="shrink-0 text-muted-foreground" />
            <span class="capitalize text-muted-foreground">{props.user.role}</span>
          </div>
          <Show when={props.user.department}>
            <div class="flex items-center gap-2 text-sm">
              <Briefcase size={16} aria-hidden="true" class="shrink-0 text-muted-foreground" />
              <span class="text-muted-foreground">{props.user.department}</span>
            </div>
          </Show>
          <div class="flex items-center gap-2 text-sm">
            <Calendar size={16} aria-hidden="true" class="shrink-0 text-muted-foreground" />
            <span class="text-muted-foreground">Joined {formattedDate()}</span>
          </div>
        </div>
      </div>

      <div class="mt-6 border-t border-border pt-4">
        <button
          type="button"
          class="w-full rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default ProfileCard;
