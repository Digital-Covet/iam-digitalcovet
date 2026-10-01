import { createEffect, type JSX, Show } from "solid-js";
import { authClient } from "@/lib/auth-client";

interface AuthGuardProps {
  redirectTo: string;
  children: JSX.Element;
}

export default function AuthGuard(props: AuthGuardProps) {
  const session = authClient.useSession();
  const isSignedIn = () => Boolean(session().data);

  createEffect(() => {
    if (!session().isPending && !isSignedIn()) {
      window.location.replace(props.redirectTo);
    }
  });

  return <Show when={isSignedIn()}>{props.children}</Show>;
}
