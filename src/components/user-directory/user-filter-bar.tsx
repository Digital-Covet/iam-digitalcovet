import Search from "lucide-solid/icons/search";
import { FILTER_CONTROL, FilterSelect } from "@/components/ui/filter-select";
import { TextField } from "@/components/ui/text-field";
import { DIRECTORY_TOUR_TARGETS } from "@/lib/tour-steps";
import {
  APP_FILTER_OPTIONS,
  ROLE_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS,
} from "@/lib/user-directory";
import type { UserFilters } from "@/types";

interface UserFilterBarProps {
  filters: UserFilters;
  shown: number;
  total: number;
  onChange: (patch: Partial<UserFilters>) => void;
}

export function UserFilterBar(props: UserFilterBarProps) {
  return (
    <div
      class="mb-4 flex flex-col gap-3 rounded-lg border border-border bg-surface p-3 lg:flex-row lg:items-center"
      data-tour={DIRECTORY_TOUR_TARGETS.filters}
    >
      <div class="lg:w-80">
        <TextField
          id="user-directory-search"
          label="Filter by name or email"
          type="search"
          srOnlyLabel
          inputClass={FILTER_CONTROL}
          placeholder="Filter by name or email…"
          value={props.filters.query}
          leadingIcon={<Search size={14} stroke-width={1.75} />}
          onInput={(query) => props.onChange({ query })}
        />
      </div>
      <div class="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3 lg:max-w-xl">
        <FilterSelect
          label="Role"
          value={props.filters.role}
          options={ROLE_FILTER_OPTIONS}
          onChange={(role) =>
            props.onChange({ role: role as UserFilters["role"] })
          }
        />
        <FilterSelect
          label="Application"
          value={props.filters.app}
          options={APP_FILTER_OPTIONS}
          onChange={(app) => props.onChange({ app: app as UserFilters["app"] })}
        />
        <FilterSelect
          label="Status"
          value={props.filters.status}
          options={STATUS_FILTER_OPTIONS}
          onChange={(status) =>
            props.onChange({ status: status as UserFilters["status"] })
          }
        />
      </div>
      <p
        class="font-mono text-xs tabular-nums text-foreground-muted lg:ml-auto"
        aria-live="polite"
      >
        Showing {props.shown.toLocaleString("en-US")} of{" "}
        {props.total.toLocaleString("en-US")} identities
      </p>
    </div>
  );
}
