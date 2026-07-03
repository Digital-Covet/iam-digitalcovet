import type { Component } from "solid-js";
import { For } from "solid-js";
import { Folder, Share2 } from "lucide-solid";
import type { AppAccess, Icon } from "@/types";

const appAccessIcons: Record<AppAccess, Icon> = {
  Share: Share2,
  Portfolio: Folder,
};

const AppAccessIcons: Component<{ access: AppAccess[] }> = (props) => (
  <div class="flex gap-1 text-muted-foreground">
    <For each={props.access}>
      {(app) => {
        const AccessIcon = appAccessIcons[app];
        return (
          <span title={app}>
            <AccessIcon size={14} aria-label={app} />
          </span>
        );
      }}
    </For>
  </div>
);

export default AppAccessIcons;
