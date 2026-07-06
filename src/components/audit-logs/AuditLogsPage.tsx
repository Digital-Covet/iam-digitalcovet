import type { Component } from "solid-js";
import { createSignal, createMemo } from "solid-js";
import type { AuditLogEntry } from "@/types";
import { Download, RefreshCw, ShieldAlert } from "lucide-solid";
import AppLayout from "@/components/AppLayout";
import AuditLogsFilterBar from "@/components/audit-logs/AuditLogFilterBar";
import AuditLogsTable from "@/components/audit-logs/AuditLogsTable";
import { auditLogEntries } from "@/data";

const PAGE_SIZE = 5;

const AuditLogsPage: Component = () => {
  const [searchQuery, setSearchQuery] = createSignal("");
  const [selectedStatus, setSelectedStatus] = createSignal("");
  const [currentPage, setCurrentPage] = createSignal(1);

  const filteredLogs = createMemo(() => {
    const query = searchQuery().trim().toLowerCase();
    const status = selectedStatus();

    return auditLogEntries.filter((entry: AuditLogEntry) => {
      const matchesStatus =
        status === "" || entry.status === status;

      const matchesSearch =
        query === "" ||
        entry.actorName.toLowerCase().includes(query) ||
        entry.actorEmail.toLowerCase().includes(query) ||
        entry.ipAddress.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  });

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedStatus("");
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val: string) => {
    setSelectedStatus(val);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <AppLayout>
      {/* Page Header */}
      <div class="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
            <ShieldAlert size={22} aria-hidden="true" class="text-primary" />
          </div>
          <div>
            <h1 class="font-heading text-2xl font-semibold tracking-tight text-foreground md:text-[2rem] md:leading-10">
              Audit &amp; Security Logs
            </h1>
            <p class="mt-1 text-sm text-muted-foreground">
              Monitor authentication events, access changes, and policy violations across your organization.
            </p>
          </div>
        </div>
        <div class="flex gap-3">
          <button
            type="button"
            class="flex items-center rounded-md border border-border px-4 py-2 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Download size={14} aria-hidden="true" class="mr-1.5" />
            Export CSV
          </button>
          <button
            type="button"
            class="flex items-center rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <RefreshCw size={14} aria-hidden="true" class="mr-1.5" />
            Refresh Logs
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <AuditLogsFilterBar
        searchQuery={searchQuery}
        setSearchQuery={handleSearchChange}
        selectedStatus={selectedStatus}
        setSelectedStatus={handleStatusChange}
        onClear={handleClearFilters}
      />

      {/* Logs Table */}
      <div class="mt-4">
        <AuditLogsTable
          logs={filteredLogs()}
          page={currentPage()}
          onPageChange={handlePageChange}
          pageSize={PAGE_SIZE}
        />
      </div>
    </AppLayout>
  );
};

export default AuditLogsPage;
