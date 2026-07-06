import type { Component } from "solid-js";
import { createSignal, createMemo } from "solid-js";
import { query, createAsync, type RouteDefinition } from "@solidjs/router";
import { Download, RefreshCw } from "lucide-solid";
import AppLayout from "@/components/AppLayout";
import AuthGuard from "@/components/auth/auth-guard";
import AuditLogsFilterBar from "@/components/audit-logs/AuditLogFilterBar";
import AuditLogsTable from "@/components/audit-logs/AuditLogsTable";
import type { AuditLogEntry } from "@/types";
import { prisma } from "@/db";
import { lookupIp } from "@/lib/ip-geolocation";

const eventLabels: Record<string, string> = {
  granted_role: "Granted Role",
  failed_login: "Failed Login",
  file_deleted: "File Deleted",
  session_initiated: "Session Initiated",
  token_renewed: "Token Renewed",
  policy_violation: "Policy Violation",
};
const targetLabels: Record<string, string> = { iam_system: "IAM System", share: "Share", portfolio: "Portfolio" };
const statusLabels: Record<string, string> = { success: "Success", failed: "Failed", warning: "Warning" };

const isPrivateIp = (ip: string) =>
  /^(127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|::1|fc|fd|fe80|localhost|internal|N\/A)/i.test(ip);

const getAuditLogs = query(async () => {
  "use server";
  const logs = await prisma.auditLog.findMany({ orderBy: { timestamp: "desc" } });

  const enriched = await Promise.all(
    logs.map(async (log) => {
      let location = log.location;
      const ip = log.ipAddress;

      if (ip && !isPrivateIp(ip) && (!location || location === "Unknown")) {
        const geo = await lookupIp(ip);
        if (geo) {
          location = geo.formatted;
          // Persist back to DB so we don't look up again
          await prisma.auditLog.update({
            where: { id: log.id },
            data: { location: geo.formatted },
          });
        }
      }

      return {
        id: log.id,
        timestamp: log.timestamp.toISOString(),
        actorName: log.actorName,
        actorEmail: log.actorEmail,
        actorAvatarUrl: log.actorAvatarUrl ?? undefined,
        actorInitials: log.actorInitials,
        event: (eventLabels[log.event] ?? log.event) as AuditLogEntry["event"],
        targetApp: (targetLabels[log.targetApp] ?? log.targetApp) as AuditLogEntry["targetApp"],
        ipAddress: ip ?? "N/A",
        location: location ?? "Unknown",
        status: (statusLabels[log.status] ?? log.status) as AuditLogEntry["status"],
      };
    }),
  );

  return enriched;
}, "auditLogs");

export const route = {
  preload: () => getAuditLogs(),
} satisfies RouteDefinition;

const PAGE_SIZE = 5;

const AuditLogsPage: Component = () => {
  const logs = createAsync(() => getAuditLogs());
  const [searchQuery, setSearchQuery] = createSignal("");
  const [selectedStatus, setSelectedStatus] = createSignal("");
  const [currentPage, setCurrentPage] = createSignal(1);

  const filteredLogs = createMemo(() => {
    const q = searchQuery().trim().toLowerCase();
    const status = selectedStatus();
    const entries = logs() ?? [];

    return entries.filter((entry) => {
      const matchesStatus = status === "" || entry.status === status;
      const matchesSearch =
        q === "" ||
        entry.actorName.toLowerCase().includes(q) ||
        entry.actorEmail.toLowerCase().includes(q) ||
        entry.ipAddress.toLowerCase().includes(q);
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
    <AuthGuard>
      <AppLayout>
      {/* Page Header */}
      <div class="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div class="flex items-center gap-3">
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
    </AuthGuard>
  );
};

export default AuditLogsPage;
