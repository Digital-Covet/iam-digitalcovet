import type { Component, JSX } from "solid-js";
import { createSignal } from "solid-js";
import Sidebar from "./Sidebar";
import TopBar from "./Top-Bar";
import MobileNavDrawer from "./MobileNavDrawer";

const AppLayout: Component<{ children: JSX.Element }> = (props) => {
  const [drawerOpen, setDrawerOpen] = createSignal(false);

  return (
    // Gradient backdrop — the page behind the floating shell
    <div class="h-screen overflow-hidden bg-linear-to-br from-zinc-100 via-zinc-50 to-zinc-200 p-1.5 md:p-3">
      {/* Floating white app shell */}
      <div class="mx-auto flex h-[calc(100vh-1.75rem)] w-full max-w-360 flex-col gap-3 overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-[0_8px_30px_rgb(0,0,0,0.08)] md:h-[calc(100vh-3rem)] md:p-3">
        <TopBar onMenuClick={() => setDrawerOpen(true)} />

        <div class="flex min-h-0 flex-1 gap-4 overflow-hidden">
          <Sidebar />
          <main class="min-h-0 min-w-0 flex-1 overflow-y-auto rounded-xl bg-background p-4 md:p-6">
            {props.children}
          </main>
        </div>
      </div>

      <MobileNavDrawer
        open={drawerOpen()}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
};
export default AppLayout;
