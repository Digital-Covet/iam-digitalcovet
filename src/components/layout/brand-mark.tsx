export function BrandMark(props: { showLabel: boolean }) {
  return (
    <div class="flex items-center gap-2.5">
      <div class="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary font-heading text-xs font-black text-primary-fg">
        DC
      </div>
      {props.showLabel && (
        <div class="flex flex-col">
          <span class="font-heading text-sm font-bold leading-none tracking-tight">
            IAM CONSOLE
          </span>
          <span class="mt-0.5 text-[9px] uppercase tracking-widest text-foreground-muted">
            Digital Covet
          </span>
        </div>
      )}
    </div>
  );
}
