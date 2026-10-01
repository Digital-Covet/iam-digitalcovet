import type { JSX } from "solid-js";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  actions?: JSX.Element;
}

export function PageHeader(props: PageHeaderProps) {
  return (
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="font-heading text-2xl font-bold leading-[1.25] tracking-[-0.02em]">
          {props.title}
        </h1>
        <p class="mt-1 text-sm text-foreground-muted">{props.subtitle}</p>
      </div>
      {props.actions && (
        <div class="flex items-center gap-2">{props.actions}</div>
      )}
    </div>
  );
}

const BUTTON_BASE =
  "inline-flex h-9 items-center justify-center gap-2 rounded-md px-3.5 text-sm font-medium transition-colors duration-[120ms] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export const BUTTON_PRIMARY = `${BUTTON_BASE} bg-primary text-primary-fg hover:bg-primary-hover`;
export const BUTTON_OUTLINE = `${BUTTON_BASE} border border-border bg-surface text-foreground hover:bg-surface-raised`;
