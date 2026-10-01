import { createAsync } from "@solidjs/router";
import Download from "lucide-solid/icons/download";
import { createSignal, Show, Suspense } from "solid-js";
import { AuditFilterBar } from "@/components/audit-logs/audit-filter-bar";
import { AuditTable } from "@/components/audit-logs/audit-table";
import { EventInspectorDrawer } from "@/components/audit-logs/event-inspector-drawer";
import { toaster } from "@/components/auth/auth-toaster";
import { BUTTON_OUTLINE, PageHeader } from "@/components/ui/page-header";
import { downloadTextFile } from "@/lib/download";
import { exportAuditLedger, getAuditLedger } from "@/lib/audit-ledger";
import { EMPTY_LEDGER_FILTERS, hasActiveLedgerFilters } from "@/lib/audit-ledger-model";
import type { AuditLedgerEntry, AuditLedgerFilters } from "@/types";

function LedgerSkeleton() {
  return <div class="h-[420px] animate-pulse rounded-lg border border-border bg-surface" aria-hidden="true" />;
}

export function AuditLogsView() {
  const [filters, setFilters] = createSignal<AuditLedgerFilters>(EMPTY_LEDGER_FILTERS);
  const [inspected, setInspected] = createSignal<AuditLedgerEntry | null>(null);
  const [exporting, setExporting] = createSignal(false);
  // `.latest` keeps the previous page on screen while a new filter set loads, instead of re-suspending.
  const ledger = createAsync(() => getAuditLedger(filters()));

  const changeFilters = (patch: Partial<AuditLedgerFilters>) => setFilters((current) => ({ ...current, page: 1, ...patch }));

  async function exportJsonl() {
    setExporting(true);
    try {
      downloadTextFile(await exportAuditLedger(filters()), "application/x-ndjson", "audit-ledger.jsonl");
    } catch (error) {
      toaster.create({
        title: "Could not export audit logs",
        description: error instanceof Error ? error.message : "Try again in a moment.",
        type: "error",
      });
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Audit Ledger"
        subtitle="Immutable security event log with actor, IP, geolocation, and token context"
        actions={
          <button type="button" class={`${BUTTON_OUTLINE} disabled:opacity-50`} disabled={exporting()} onClick={exportJsonl}>
            <Download size={16} stroke-width={1.75} />
            {exporting() ? "Exporting…" : "Export JSONL"}
          </button>
        }
      />
      <Suspense fallback={<LedgerSkeleton />}>
        <Show
          when={ledger.latest}
          fallback={
            <p class="rounded-lg border border-border bg-surface p-6 text-sm text-foreground-muted">
              The audit ledger is available to administrators only.
            </p>
          }
        >
          {(loaded) => (
            <>
              <AuditFilterBar filters={filters()} onChange={changeFilters} />
              <AuditTable
                ledger={loaded()}
                hasActiveFilters={hasActiveLedgerFilters(filters())}
                onInspect={setInspected}
                onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
                onClearFilters={() => setFilters(EMPTY_LEDGER_FILTERS)}
              />
            </>
          )}
        </Show>
      </Suspense>
      <EventInspectorDrawer entry={inspected()} onClose={() => setInspected(null)} />
    </>
  );
}
