import { Meta, Title } from "@solidjs/meta";
import { AuditLogsView } from "@/components/audit-logs/audit-logs-view";
import { AppShell } from "@/components/layout/app-shell";
import { getAuditLedger } from "@/lib/audit-ledger";
import { EMPTY_LEDGER_FILTERS } from "@/lib/audit-ledger-model";
import { pageMetadata } from "@/lib/seo";

export const route = {
  preload: () => getAuditLedger(EMPTY_LEDGER_FILTERS),
};

export default function AuditLogsPage() {
  return (
    <>
      <Title>{pageMetadata.auditLogs.title}</Title>
      <Meta name="description" content={pageMetadata.auditLogs.description} />
      <AppShell>
        <AuditLogsView />
      </AppShell>
    </>
  );
}
