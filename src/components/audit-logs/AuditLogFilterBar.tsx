
import type { Component } from "solid-js";
import { Search, Filter, Calendar, X } from "lucide-solid";

interface AuditLogsFilterBarProps {
  searchQuery: () => string;
  setSearchQuery: (val: string) => void;
  selectedStatus: () => string;
  setSelectedStatus: (val: string) => void;
  onClear: () => void;
}

const statusOptions: { value: string; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "Success", label: "Success" },
  { value: "Failed", label: "Failed" },
  { value: "Warning", label: "Warning" },
];

const inputBaseClass =
  "w-full rounded-md border border-input bg-muted py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-ring";

const AuditLogsFilterBar: Component<AuditLogsFilterBarProps> = (props) => {
  const hasActiveFilters = () =>
    props.searchQuery().trim() !== "" || props.selectedStatus() !== "";

  return (
    <div class="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-[0_4px_6px_-1px_rgb(0,0,0,0.05)] sm:flex-row sm:items-center">
      {/* Search Input */}
      <div class="relative flex-1">
        <label for="audit-search" class="sr-only">
          Search audit logs
        </label>
        <Search
          size={18}
          aria-hidden="true"
          class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          id="audit-search"
          type="text"
          placeholder="Search by actor, email, or IP address..."
          class={`${inputBaseClass} pl-10 pr-4`}
          value={props.searchQuery()}
          onInput={(e) => props.setSearchQuery(e.currentTarget.value)}
        />
      </div>

      {/* Status Filter */}
      <div class="relative">
        <label for="audit-status-filter" class="sr-only">
          Filter by status
        </label>
        <Filter
          size={16}
          aria-hidden="true"
          class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <select
          id="audit-status-filter"
          class={`${inputBaseClass} appearance-none pl-9 pr-8 ${props.selectedStatus() === "" ? "text-muted-foreground" : ""}`}
          value={props.selectedStatus()}
          onChange={(e) => props.setSelectedStatus(e.currentTarget.value)}
        >
          {statusOptions.map((opt) => (
            <option value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Calendar Button */}
      <button
        type="button"
        aria-label="Filter by date range"
        class="inline-flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <Calendar size={16} aria-hidden="true" />
        <span class="hidden sm:inline">Date Range</span>
      </button>

      {/* Clear Filters */}
      {hasActiveFilters() && (
        <button
          type="button"
          aria-label="Clear all filters"
          onClick={props.onClear}
          class="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <X size={14} aria-hidden="true" />
          Clear
        </button>
      )}
    </div>
  );
};

export default AuditLogsFilterBar;
