import { Avatar } from "@ark-ui/solid/avatar";
import { type Component, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { Menu, Search, Settings } from "lucide-solid";
import IconButton from "./IconButton";
import { useAuth } from "./auth/auth-context";

interface TopBarProps {
  onMenuClick?: () => void;
}

const TopBar: Component<TopBarProps> = (props) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <header class="flex h-16 w-full shrink-0 items-center justify-between rounded-xl border border-border bg-card px-3 md:px-6 text-sm shadow-sm">
      <div class="flex flex-1 items-center gap-2">
        <button
          type="button"
          aria-label="Open navigation menu"
          class="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:hidden"
          onClick={props.onMenuClick}
        >
          <Menu size={22} aria-hidden="true" />
        </button>
        <div class="relative hidden w-full max-w-md md:flex">
          <label for="iam-search" class="sr-only">Search IAM</label>
          <Search
            size={20}
            aria-hidden="true"
            class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            id="iam-search"
            type="text"
            placeholder="Search IAM..."
            class="w-full rounded-md border border-input bg-muted py-2 pl-10 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>
      <div class="flex items-center gap-2 md:gap-4 text-muted-foreground">

        <IconButton icon={Settings} label="Settings" onClick={() => navigate("/account-settings")} />
        <button
          type="button"
          aria-label="Open profile menu"
          class="ml-2 h-8 w-8 shrink-0 cursor-pointer overflow-hidden rounded-full border border-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Avatar.Root class="h-full w-full">
            <Avatar.Fallback class="flex h-full w-full items-center justify-center bg-muted text-[10px] font-bold">
              {user()?.initials ?? "U"}
            </Avatar.Fallback>
            <Show when={user()?.image}>
              <Avatar.Image src={user()!.image!} alt="Profile photo of the signed-in administrator" />
            </Show>
          </Avatar.Root>
        </button>
      </div>
    </header>
  );
};
export default TopBar;
