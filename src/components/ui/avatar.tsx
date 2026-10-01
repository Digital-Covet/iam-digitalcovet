import { Avatar } from "@ark-ui/solid/avatar";
import { Show } from "solid-js";

interface AppAvatarProps {
  initials: string;
  src?: string | null;
  label: string;
  size?: "xs" | "sm" | "md" | "lg";
  toneClass?: string;
}

const SIZES = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-14 w-14 text-lg",
} as const;

export function AppAvatar(props: AppAvatarProps) {
  return (
    <Avatar.Root
      class={`flex shrink-0 items-center justify-center rounded-full bg-border font-heading font-bold text-foreground ${SIZES[props.size ?? "sm"]} ${props.toneClass ?? ""}`}
    >
      <Avatar.Fallback class="flex h-full w-full items-center justify-center rounded-full">
        {props.initials}
      </Avatar.Fallback>
      <Show when={props.src}>
        {(url) => <Avatar.Image src={url()} alt={props.label} class="h-full w-full rounded-full object-cover" />}
      </Show>
    </Avatar.Root>
  );
}
