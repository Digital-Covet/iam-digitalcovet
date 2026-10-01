import { Menu } from "@ark-ui/solid/menu";
import { useNavigate } from "@solidjs/router";
import ChevronsUpDown from "lucide-solid/icons/chevrons-up-down";
import LogOut from "lucide-solid/icons/log-out";
import UserRound from "lucide-solid/icons/user-round";
import { Show } from "solid-js";
import { Portal } from "solid-js/web";
import { AppAvatar } from "@/components/ui/avatar";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/lib/constants";
import { toInitials } from "@/lib/initials";

interface AccountMenuProps {
  currentPath: string;
  collapsed: boolean;
  onNavigate?: () => void;
}

interface SessionUser {
  name?: string;
  email?: string;
  role?: string;
}

const MENU_ACCOUNT = "account";
const MENU_SIGN_OUT = "sign-out";

const ITEM_CLASS =
  "flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 text-[13px] font-medium " +
  "transition-colors duration-[120ms] focus:outline-none";

async function signOut() {
  await authClient.signOut();
  window.location.assign(ROUTES.LOGIN);
}

export function AccountMenu(props: AccountMenuProps) {
  const session = authClient.useSession();
  const user = () => session().data?.user as SessionUser | undefined;
  const navigate = useNavigate();
  const onAccountPage = () =>
    props.currentPath.startsWith(ROUTES.ACCOUNT_SETTINGS);

  function handleSelect(value: string) {
    if (value === MENU_ACCOUNT) {
      props.onNavigate?.();
      navigate(ROUTES.ACCOUNT_SETTINGS);
    } else if (value === MENU_SIGN_OUT) {
      void signOut();
    }
  }

  return (
    <div class="border-t border-border p-2">
      <Menu.Root
        positioning={{ placement: "top-start", gutter: 8 }}
        onSelect={(details) => handleSelect(details.value)}
      >
        <Menu.Trigger
          aria-label="Account menu"
          class="flex w-full items-center gap-2.5 rounded-md p-1 text-left transition-colors duration-[120ms] hover:bg-surface focus-visible:outline-2 focus-visible:outline-ring data-[state=open]:bg-surface"
          classList={{ "bg-primary/10": onAccountPage() }}
        >
          <AppAvatar
            initials={toInitials(user()?.name ?? user()?.email ?? "")}
            label={user()?.email ?? "Account"}
            size="sm"
          />
          <Show when={!props.collapsed}>
            <div class="min-w-0 flex-1">
              <p class="truncate text-xs font-medium">
                {user()?.name ?? user()?.email}
              </p>
              <p class="font-mono text-[10px] uppercase text-foreground-muted">
                {user()?.role}
              </p>
            </div>
            <ChevronsUpDown
              size={14}
              stroke-width={1.75}
              class="shrink-0 text-foreground-muted"
            />
          </Show>
        </Menu.Trigger>

        <Portal>
          <Menu.Positioner>
            <Menu.Content class="relative z-[60] w-52 rounded-lg border border-border bg-surface-raised p-1.5 shadow-xl focus:outline-none">
              <Menu.Item
                value={MENU_ACCOUNT}
                class={`${ITEM_CLASS} text-foreground data-[highlighted]:bg-surface`}
              >
                <UserRound
                  size={16}
                  stroke-width={1.75}
                  class="text-foreground-muted"
                />
                <span class="flex-1">Account settings</span>
              </Menu.Item>

              <Menu.Item
                value={MENU_SIGN_OUT}
                class={`${ITEM_CLASS} text-[#f87171] data-[highlighted]:bg-red-500/10`}
              >
                <LogOut size={16} stroke-width={1.75} />
                <span class="flex-1">Sign out</span>
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </div>
  );
}
