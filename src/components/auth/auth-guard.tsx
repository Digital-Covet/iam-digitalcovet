import { createEffect, type JSX, Show } from "solid-js";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/lib/constants";

interface AuthGuardProps {
  redirectTo: string;
  /** Also bounce signed-in users who have not enrolled an authenticator. */
  requireTwoFactor?: boolean;
  children: JSX.Element;
}

function setupTwoFactorUrl(): string {
  const { pathname, search } = window.location;
  return `${ROUTES.SETUP_2FA}?redirect=${encodeURIComponent(pathname + search)}`;
}

export default function AuthGuard(props: AuthGuardProps) {
  const session = authClient.useSession();
  const isSignedIn = () => Boolean(session().data);
  const needsEnrollment = () =>
    Boolean(props.requireTwoFactor) &&
    isSignedIn() &&
    session().data?.user.twoFactorEnabled !== true;

  createEffect(() => {
    if (session().isPending) return;
    if (!isSignedIn()) window.location.replace(props.redirectTo);
    else if (needsEnrollment()) window.location.replace(setupTwoFactorUrl());
  });

  return (
    <Show when={isSignedIn() && !needsEnrollment()}>{props.children}</Show>
  );
}
