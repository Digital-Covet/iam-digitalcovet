const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export const inputClass =
  "w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-ring disabled:opacity-50";

export const primaryButtonClass = `rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50 ${focusRing}`;

export const secondaryButtonClass = `rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50 ${focusRing}`;

export const smallSecondaryButtonClass = `rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50 ${focusRing}`;
