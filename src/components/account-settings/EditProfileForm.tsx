import type { Component } from "solid-js";
import { createSignal } from "solid-js";
import { authToaster } from "@/components/auth/auth-toaster";
import { updateOwnName } from "@/lib/account-settings";
import { createAccountAction } from "./account-action";
import FormError from "./FormError";
import { inputClass, primaryButtonClass } from "./styles";

interface EditProfileFormProps {
  name: string;
  email: string;
  onSaved: () => void;
}

const EditProfileForm: Component<EditProfileFormProps> = (props) => {
  const [name, setName] = createSignal(props.name);
  const { pending, error, run } = createAccountAction();

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    if (await run(() => updateOwnName(name()))) {
      authToaster.create({ title: "Profile updated.", type: "success" });
      props.onSaved();
    }
  };

  return (
    <form onSubmit={handleSubmit} class="space-y-4">
      <div>
        <label for="profile-name" class="mb-1.5 block text-sm font-medium text-foreground">
          Full name
        </label>
        <input
          id="profile-name"
          type="text"
          required
          maxlength={100}
          autocomplete="name"
          class={inputClass}
          value={name()}
          onInput={(e) => setName(e.currentTarget.value)}
        />
      </div>
      <div>
        <label for="profile-email" class="mb-1.5 block text-sm font-medium text-foreground">
          Email
        </label>
        <input id="profile-email" type="email" disabled class={inputClass} value={props.email} />
        <p class="mt-1.5 text-xs text-muted-foreground">
          Ask an administrator to change your email address.
        </p>
      </div>
      <FormError message={error()} />
      <button type="submit" disabled={pending()} class={`${primaryButtonClass} w-full`}>
        {pending() ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
};

export default EditProfileForm;
