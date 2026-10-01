import { type JSX } from "solid-js";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: JSX.Element;
}

function CovetMonogram(props: { class?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      stroke-width="3"
      stroke-linejoin="round"
      aria-hidden="true"
      class={props.class}
    >
      <path d="M32 4 58 18v28L32 60 6 46V18z" />
      <path d="M22 22h10a10 10 0 0 1 0 20H22z" />
    </svg>
  );
}

export function AuthShell(props: AuthShellProps) {
  return (
    <div class="dark relative min-h-screen overflow-hidden bg-background px-4 py-12 font-sans text-foreground antialiased">
      <CovetMonogram class="pointer-events-none absolute -bottom-24 -right-24 h-[28rem] w-[28rem] text-foreground opacity-[0.05]" />

      <main class="relative mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-[420px] flex-col justify-center">
        <header class="mb-8 text-center">
          <div class="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-fg">
            <CovetMonogram class="h-6 w-6" />
          </div>
          <h1 class="font-heading text-[26px] font-extrabold leading-tight tracking-[-0.03em]">
            {props.title}
          </h1>
          <p class="mt-2 text-sm text-foreground-muted">{props.subtitle}</p>
        </header>

        <section class="rounded-lg border border-border bg-surface p-8 shadow-lg">
          {props.children}
        </section>

        <p class="mt-8 text-center text-xs text-foreground-muted">
          Authorized personnel only. All access attempts are logged for audit compliance.
        </p>
      </main>
    </div>
  );
}
