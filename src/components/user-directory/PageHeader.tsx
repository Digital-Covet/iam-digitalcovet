import type { Component } from "solid-js";
import { Download, Plus } from "lucide-solid";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  onInviteClick?: () => void;
}

const PageHeader: Component<PageHeaderProps> = (props) => (
  <div class="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
    <div>
      <h1 class="text-2xl font-semibold tracking-tight text-foreground md:text-[2rem] md:leading-10">
        {props.title}
      </h1>
      <p class="mt-1 text-sm text-muted-foreground">{props.subtitle}</p>
    </div>
    <div class="flex gap-4">
      <button
        type="button"
        class="flex items-center rounded-md border border-border px-4 py-2 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <Download size={14} aria-hidden="true" class="mr-1" />
        Export CSV
      </button>
      <button
        type="button"
        onClick={props.onInviteClick}
        class="flex items-center rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <Plus size={14} aria-hidden="true" class="mr-1" />
        Add New User
      </button>
    </div>
  </div>
);

export default PageHeader;
