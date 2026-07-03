import type { Component } from "solid-js";
import type { MfaStatus } from "@/types";

const statusStyles: Record<MfaStatus, { text: string; dot: string }> = {
  Enabled: { text: "text-foreground", dot: "bg-primary" },
  Disabled: { text: "text-destructive", dot: "bg-destructive" },
};

const MfaStatusIndicator: Component<{ status: MfaStatus }> = (props) => (
  <div class={`flex items-center ${statusStyles[props.status].text}`}>
    <span
      aria-hidden="true"
      class={`mr-2 h-2 w-2 rounded-full ${statusStyles[props.status].dot}`}
    />
    <span class="text-sm">{props.status}</span>
  </div>
);

export default MfaStatusIndicator;
