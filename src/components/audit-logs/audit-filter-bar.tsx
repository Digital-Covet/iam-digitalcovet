import Search from "lucide-solid/icons/search";
import { createEffect, createSignal, onCleanup } from "solid-js";
import {
  FILTER_CONTROL as CONTROL,
  FilterSelect,
} from "@/components/ui/filter-select";
import { TextField } from "@/components/ui/text-field";
import {
  EVENT_OPTIONS,
  RANGE_OPTIONS,
  STATUS_OPTIONS,
  TARGET_APP_OPTIONS,
} from "@/lib/audit-ledger-model";
import type { AuditLedgerFilters } from "@/types";

const ACTOR_DEBOUNCE_MS = 350;

interface AuditFilterBarProps {
  filters: AuditLedgerFilters;
  onChange: (patch: Partial<AuditLedgerFilters>) => void;
}

export function AuditFilterBar(props: AuditFilterBarProps) {
  const [actor, setActor] = createSignal(props.filters.actor);
  let debounce: ReturnType<typeof setTimeout> | undefined;
  onCleanup(() => clearTimeout(debounce));

  function updateActor(value: string) {
    setActor(value);
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      debounce = undefined;
      props.onChange({ actor: value });
    }, ACTOR_DEBOUNCE_MS);
  }

  createEffect(() => {
    if (props.filters.actor === "" && debounce === undefined) setActor("");
  });

  return (
    <div class="mb-4 grid grid-cols-1 gap-3 rounded-lg border border-border bg-surface p-3 sm:grid-cols-2 lg:grid-cols-5">
      <FilterSelect
        label="Time range"
        value={props.filters.range}
        options={RANGE_OPTIONS}
        onChange={(range) =>
          props.onChange({ range: range as AuditLedgerFilters["range"] })
        }
      />
      <TextField
        id="audit-actor-search"
        label="Actor email, name, or ID"
        type="search"
        srOnlyLabel
        inputClass={CONTROL}
        placeholder="Actor email / ID"
        value={actor()}
        leadingIcon={<Search size={14} stroke-width={1.75} />}
        onInput={updateActor}
      />
      <FilterSelect
        label="Event type"
        value={props.filters.event}
        options={EVENT_OPTIONS}
        onChange={(event) => props.onChange({ event })}
      />
      <FilterSelect
        label="Target app"
        value={props.filters.targetApp}
        options={TARGET_APP_OPTIONS}
        onChange={(targetApp) => props.onChange({ targetApp })}
      />
      <FilterSelect
        label="Outcome"
        value={props.filters.status}
        options={STATUS_OPTIONS}
        onChange={(status) => props.onChange({ status })}
      />
    </div>
  );
}
