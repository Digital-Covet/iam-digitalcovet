import { MetaProvider } from "@solidjs/meta";
import { Router, useLocation } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { type JSX, Show, Suspense } from "solid-js";
import AuthGuard from "@/components/auth/auth-guard";
import { AuthToaster } from "@/components/auth/auth-toaster";
import { RouteFallback } from "@/components/ui/route-fallback";
import { ROUTES } from "@/lib/constants";
import "./app.css";

const PUBLIC_PATH_PREFIX = "/auth/";

function RootLayout(props: { children: JSX.Element }) {
  const location = useLocation();
  const isPublic = () => location.pathname.startsWith(PUBLIC_PATH_PREFIX);
  const loginRedirect = () =>
    `${ROUTES.LOGIN}?redirect=${encodeURIComponent(location.pathname + location.search)}`;

  return (
    <Show when={!isPublic()} fallback={props.children}>
      <AuthGuard redirectTo={loginRedirect()} requireTwoFactor>
        {props.children}
      </AuthGuard>
    </Show>
  );
}

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Suspense fallback={<RouteFallback />}>
            <RootLayout>{props.children}</RootLayout>
          </Suspense>
          <AuthToaster />
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
