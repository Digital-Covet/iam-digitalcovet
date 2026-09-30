import type { Component } from "solid-js";
import { Show } from "solid-js";

const FormError: Component<{ message: string | null }> = (props) => (
  <Show when={props.message}>
    <p role="alert" class="rounded-md border border-red-100 bg-red-50 p-3 text-sm text-red-600">
      {props.message}
    </p>
  </Show>
);

export default FormError;
