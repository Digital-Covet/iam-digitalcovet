import LoaderCircle from "lucide-solid/icons/loader-circle";

export function RouteFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      class="flex min-h-screen items-center justify-center text-foreground-muted"
    >
      <LoaderCircle class="size-6 animate-spin" aria-hidden="true" />
      <span class="sr-only">Loading</span>
    </div>
  );
}
