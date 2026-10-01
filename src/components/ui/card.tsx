import type { JSX } from "solid-js";

export function Card(props: { class?: string; children: JSX.Element }) {
  return (
    <section class={`rounded-lg border border-border bg-surface shadow-xs ${props.class ?? ""}`}>
      {props.children}
    </section>
  );
}

export function CardHeader(props: { title: string; aside?: JSX.Element }) {
  return (
    <header class="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
      <h3 class="font-heading text-[15px] font-semibold leading-[1.35] text-foreground">{props.title}</h3>
      {props.aside}
    </header>
  );
}
