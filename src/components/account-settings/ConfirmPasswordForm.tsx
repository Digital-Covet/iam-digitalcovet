import type { Component } from "solid-js";
import { createSignal } from "solid-js";
import { createAccountAction } from "./account-action";
import FormError from "./FormError";
import PasswordField from "./PasswordField";
import { primaryButtonClass } from "./styles";

interface ConfirmPasswordFormProps {
  submitLabel: string;
  onConfirm: (password: string) => Promise<void>;
}

const ConfirmPasswordForm: Component<ConfirmPasswordFormProps> = (props) => {
  const [password, setPassword] = createSignal("");
  const { pending, error, run } = createAccountAction();

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    await run(() => props.onConfirm(password()));
  };

  return (
    <form onSubmit={handleSubmit} class="space-y-4">
      <PasswordField label="Password" autoComplete="current-password" onInput={setPassword} />
      <FormError message={error()} />
      <button type="submit" disabled={pending()} class={`${primaryButtonClass} w-full`}>
        {pending() ? "Checking..." : props.submitLabel}
      </button>
    </form>
  );
};

export default ConfirmPasswordForm;
