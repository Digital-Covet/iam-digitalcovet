import type { Component, JSX } from "solid-js";
import type { Icon } from "@/types";

interface IconButtonProps {
  icon: Icon;
  label: string;
  class?: string;
  onClick?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>;
}

const IconButton: Component<IconButtonProps> = (props): JSX.Element => (
  <button
    type="button"
    aria-label={props.label}
    class={`cursor-pointer rounded-full p-2 transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:opacity-80 ${props.class ?? ""}`}
    onClick={props.onClick}
  >
    <props.icon size={22} aria-hidden="true" />
  </button>
);

export default IconButton;
