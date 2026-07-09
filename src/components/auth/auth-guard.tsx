import { useNavigate } from "@solidjs/router";
import { createSignal, type JSX, onCleanup, onMount, Show } from "solid-js";
import { authClient } from "@/lib/auth-client";
import { resolveAvatarUrl } from "@/lib/avatar";
import { AuthProvider, type AuthUser } from "./auth-context";

interface AuthGuardProps {
  children: JSX.Element;
  redirectTo?: string;
}

function computeInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function AuthGuard(props: AuthGuardProps) {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = createSignal(true);
  const [user, setUser] = createSignal<AuthUser | null>(null);

  onMount(() => {
    let cancelled = false;

    void (async () => {
      try {
        const session = await authClient.getSession();
        if (cancelled) return;

        if (!session.data?.session) {
          navigate(props.redirectTo ?? "/auth/login", { replace: true });
          return;
        }

        const userData = (session.data as any)?.user;
        if (!userData) {
          navigate(props.redirectTo ?? "/auth/login", { replace: true });
          return;
        }
        setUser({
          name: userData.name,
          email: userData.email,
          initials: computeInitials(userData.name),
          image: resolveAvatarUrl(userData.image),
        });
      } catch {
        if (!cancelled) {
          navigate(props.redirectTo ?? "/auth/login", { replace: true });
        }
        return;
      } finally {
        if (!cancelled) {
          setIsChecking(false);
        }
      }
    })();

    onCleanup(() => {
      cancelled = true;
    });
  });

  return (
    <Show
      when={!isChecking()}
      fallback={
        <div class="flex h-screen items-center justify-center">Loading...</div>
      }
    >
      <AuthProvider value={{ user, isLoaded: () => !isChecking() }}>
        {props.children}
      </AuthProvider>
    </Show>
  );
}
