import UserCheck from "lucide-solid/icons/user-check";
import { onCleanup, onMount } from "solid-js";
import { authClient } from "@/lib/auth-client";

async function exitImpersonation() {
  await authClient.admin.stopImpersonating();
  window.location.reload();
}

export function ImpersonationBanner(props: { email: string }) {
  let lastEscape = 0;
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Escape") return;
    const now = Date.now();
    if (now - lastEscape < 500) void exitImpersonation();
    lastEscape = now;
  };

  onMount(() => window.addEventListener("keydown", onKeyDown));
  onCleanup(() => window.removeEventListener("keydown", onKeyDown));

  return (
    <div
      role="alert"
      class="z-50 flex h-8 items-center justify-between bg-amber-500 px-4 text-xs font-medium text-black"
    >
      <span class="flex items-center gap-2">
        <UserCheck size={14} stroke-width={2} />
        Active Impersonation: <strong>{props.email}</strong>
      </span>
      <button
        type="button"
        onClick={exitImpersonation}
        class="rounded bg-black/15 px-2 py-0.5 font-mono text-[11px] transition-colors hover:bg-black/25"
      >
        Exit Session [Esc Esc]
      </button>
    </div>
  );
}
