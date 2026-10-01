import type { TourStepDetails } from "@ark-ui/solid/tour";
import { Tour, useTour } from "@ark-ui/solid/tour";
import X from "lucide-solid/icons/x";
import { createEffect, createSignal, For, on, onMount, Show } from "solid-js";
import { Portal } from "solid-js/web";
import {
  markTourCompleted,
  restartRequest,
  type TourId,
} from "@/lib/tour-state";
import { TOURS } from "@/lib/tour-steps";

const DESKTOP_QUERY = "(min-width: 768px)";
const FINISHED_STATUSES: ReadonlySet<string> = new Set([
  "completed",
  "skipped",
  "dismissed",
]);

// Ark only positions tooltip steps; dialog steps need centering from our own CSS.
// Tooltip steps get an inline z-index of (--tour-layer + --tour-z-index) that beats any class,
// so the base layer must be supplied through that variable to sit above the backdrop.
const POSITIONER_CLASS =
  "z-[90] [--tour-z-index:88] data-[type=dialog]:pointer-events-none data-[type=dialog]:fixed data-[type=dialog]:inset-0 " +
  "data-[type=dialog]:flex data-[type=dialog]:items-center data-[type=dialog]:justify-center";

const ACTION_CLASS =
  "inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-medium " +
  "text-foreground transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-ring " +
  "data-[action=next]:border-transparent data-[action=next]:bg-primary data-[action=next]:text-white " +
  "data-[action=dismiss]:border-transparent data-[action=dismiss]:bg-primary data-[action=dismiss]:text-white";

/** Steps whose target is missing (e.g. an empty table) are dropped rather than shown unanchored. */
function currentSteps(id: TourId): TourStepDetails[] {
  const desktop = window.matchMedia(DESKTOP_QUERY).matches;
  return TOURS[id]
    .buildSteps({ desktop })
    .filter((step) => step.type !== "tooltip" || step.target?.());
}

const TARGET_POLL_MS = 100;
const TARGET_POLL_ATTEMPTS = 20;

/** Targets can render after mount (session or data loading), so wait briefly for all of them. */
async function stepsOnceTargetsRender(id: TourId): Promise<TourStepDetails[]> {
  const expected = TOURS[id].buildSteps({
    desktop: window.matchMedia(DESKTOP_QUERY).matches,
  }).length;
  for (let attempt = 0; attempt < TARGET_POLL_ATTEMPTS; attempt++) {
    const steps = currentSteps(id);
    if (steps.length === expected) return steps;
    await new Promise((resolve) => setTimeout(resolve, TARGET_POLL_MS));
  }
  return currentSteps(id);
}

function createTourController(id: TourId) {
  return useTour({
    steps: currentSteps(id),
    onStatusChange: (details) => {
      if (FINISHED_STATUSES.has(details.status)) markTourCompleted(id);
    },
  });
}

type TourController = ReturnType<typeof createTourController>;

export function GuidedTour(props: { id: TourId }) {
  const [controller, setController] = createSignal<TourController>();

  async function startTour(active: ReturnType<TourController>) {
    active.setSteps(await stepsOnceTargetsRender(props.id));
    active.start();
  }

  onMount(() => {
    const created = createTourController(props.id);
    setController(() => created);
    if (TOURS[props.id].shouldAutoStart()) void startTour(created());
  });

  createEffect(
    on(
      restartRequest,
      (request) => {
        const active = controller()?.();
        if (request?.id === props.id && active) void startTour(active);
      },
      { defer: true },
    ),
  );

  return (
    <Show when={controller()}>
      {(tour) => (
        <Tour.Root tour={tour()}>
          <Portal>
            <Tour.Backdrop class="fixed inset-0 z-[80] bg-black/50" />
            <Tour.Spotlight class="z-[80] rounded-md ring-2 ring-primary" />
            <Tour.Positioner class={POSITIONER_CLASS}>
              <Tour.Content class="pointer-events-auto relative z-[90] w-[320px] max-w-[calc(100vw-2rem)] rounded-lg border border-border bg-surface-raised p-4 shadow-xl focus:outline-none">
                <Tour.CloseTrigger
                  aria-label="Close tour"
                  class="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded text-foreground-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <X size={14} stroke-width={1.75} />
                </Tour.CloseTrigger>
                <Tour.ProgressText class="font-mono text-[10px] uppercase tracking-[0.08em] text-foreground-muted" />
                <Tour.Title class="mt-1 pr-6 font-heading text-base font-bold tracking-[-0.01em]" />
                <Tour.Description class="mt-1 text-[13px] text-foreground-muted" />
                <Tour.Control class="mt-4 flex justify-end gap-2">
                  <Tour.Actions>
                    {(actions) => (
                      <For each={actions()}>
                        {(action) => (
                          <Tour.ActionTrigger
                            action={action}
                            class={ACTION_CLASS}
                          />
                        )}
                      </For>
                    )}
                  </Tour.Actions>
                </Tour.Control>
              </Tour.Content>
            </Tour.Positioner>
          </Portal>
        </Tour.Root>
      )}
    </Show>
  );
}
