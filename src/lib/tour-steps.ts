import type { TourStepDetails } from "@ark-ui/solid/tour";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { hasCompletedTour, type TourId } from "@/lib/tour-state";

export const ACCOUNT_MENU_TOUR_ID = "account-menu";

export const DIRECTORY_TOUR_TARGETS = {
  stats: "directory-stats",
  filters: "directory-filters",
  table: "directory-table",
  export: "directory-export",
  invite: "directory-invite",
} as const;

export interface TourEnvironment {
  desktop: boolean;
}

export interface TourDefinition {
  buildSteps: (environment: TourEnvironment) => TourStepDetails[];
  shouldAutoStart: () => boolean;
}

const NAV_DESCRIPTIONS: Readonly<Record<string, string>> = {
  "/dashboard": "Live sessions, security posture and application health.",
  "/": "Invite people, assign roles, and suspend or remove accounts.",
  "/apps": "Register OAuth clients and manage logout endpoints.",
  "/roles-access": "Define roles and the permissions each one grants.",
  "/audit-logs": "Search and export every security-relevant event.",
  "/auth-settings": "Set password rules and test them before they go live.",
};

export function navTourId(href: string) {
  return `nav-${href}`;
}

function tourTarget(id: string) {
  return () => document.querySelector<HTMLElement>(`[data-tour="${id}"]`);
}

const BACK = { label: "Back", action: "prev" } as const;
const NEXT = { label: "Next", action: "next" } as const;
const FINISH = { label: "Finish", action: "dismiss" } as const;

function navSteps(): TourStepDetails[] {
  return NAV_ITEMS.map((item) => ({
    id: navTourId(item.href),
    type: "tooltip",
    placement: "right-start",
    title: item.label,
    description: NAV_DESCRIPTIONS[item.href] ?? "",
    target: tourTarget(navTourId(item.href)),
    actions: [BACK, NEXT],
  }));
}

/** The sidebar is hidden below the md breakpoint, so nav steps only apply on desktop. */
function buildConsoleSteps({ desktop }: TourEnvironment): TourStepDetails[] {
  const sidebarSteps: TourStepDetails[] = desktop
    ? [
        ...navSteps(),
        {
          id: ACCOUNT_MENU_TOUR_ID,
          type: "tooltip",
          placement: "right-end",
          title: "Your account",
          description:
            "Open account settings to manage your password, sessions and two-factor authentication.",
          target: tourTarget(ACCOUNT_MENU_TOUR_ID),
          actions: [BACK, NEXT],
        },
      ]
    : [];

  return [
    {
      id: "welcome",
      type: "dialog",
      title: "Welcome to the IAM console",
      description:
        "A quick tour of where everything lives. It takes under a minute.",
      actions: [{ label: "Start tour", action: "next" }],
    },
    ...sidebarSteps,
    {
      id: "done",
      type: "dialog",
      title: "You're all set",
      description:
        "Restart this tour any time from the account menu in the sidebar.",
      actions: [FINISH],
    },
  ];
}

function buildDirectorySteps(): TourStepDetails[] {
  const {
    stats,
    filters,
    table,
    export: exportId,
    invite,
  } = DIRECTORY_TOUR_TARGETS;
  const firstRow = () =>
    document.querySelector<HTMLElement>(
      `[data-tour="${table}"] tbody tr:first-child`,
    );

  return [
    {
      id: stats,
      type: "tooltip",
      placement: "bottom",
      title: "Directory at a glance",
      description: "Headcount, active accounts and suspended access, live.",
      target: tourTarget(stats),
      actions: [NEXT],
    },
    {
      id: filters,
      type: "tooltip",
      placement: "bottom",
      title: "Find anyone fast",
      description:
        "Search by name or email, then narrow by role, application or status.",
      target: tourTarget(filters),
      actions: [BACK, NEXT],
    },
    {
      id: table,
      type: "tooltip",
      placement: "bottom",
      title: "Manage each account",
      description:
        "Click a person to edit them. The ⋯ menu handles suspending, restoring, impersonating and removing.",
      target: firstRow,
      actions: [BACK, NEXT],
    },
    {
      id: exportId,
      type: "tooltip",
      placement: "bottom-end",
      title: "Export CSV",
      description: "Download the list exactly as currently filtered.",
      target: tourTarget(exportId),
      actions: [BACK, NEXT],
    },
    {
      id: invite,
      type: "tooltip",
      placement: "bottom-end",
      title: "Invite an employee",
      description: "Send an invitation with a role and application access.",
      target: tourTarget(invite),
      actions: [BACK, FINISH],
    },
  ];
}

export const TOURS: Readonly<Record<TourId, TourDefinition>> = {
  console: {
    buildSteps: buildConsoleSteps,
    shouldAutoStart: () => !hasCompletedTour("console"),
  },
  "user-directory": {
    buildSteps: buildDirectorySteps,
    // Wait until the console tour is done so the two never overlap.
    shouldAutoStart: () =>
      hasCompletedTour("console") && !hasCompletedTour("user-directory"),
  },
};
