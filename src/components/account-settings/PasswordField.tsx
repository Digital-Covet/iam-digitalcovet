import { PasswordInput } from "@ark-ui/solid/password-input";
import type { Component } from "solid-js";
import { EyeIcon, EyeOffIcon } from "lucide-solid";
import { inputClass } from "./styles";

interface PasswordFieldProps {
  label: string;
  autoComplete: "current-password" | "new-password";
  onInput: (value: string) => void;
}

const PasswordField: Component<PasswordFieldProps> = (props) => (
  <PasswordInput.Root autoComplete={props.autoComplete} class="w-full">
    <PasswordInput.Label class="mb-1.5 block text-sm font-medium text-foreground">
      {props.label}
    </PasswordInput.Label>
    <PasswordInput.Control class="relative flex items-center">
      <PasswordInput.Input
        required
        class={`${inputClass} pr-10`}
        onInput={(e) => props.onInput(e.currentTarget.value)}
      />
      <PasswordInput.VisibilityTrigger class="absolute right-2 flex items-center justify-center rounded-sm p-1 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <PasswordInput.Indicator fallback={<EyeOffIcon class="size-4" />}>
          <EyeIcon class="size-4" />
        </PasswordInput.Indicator>
      </PasswordInput.VisibilityTrigger>
    </PasswordInput.Control>
  </PasswordInput.Root>
);

export default PasswordField;
