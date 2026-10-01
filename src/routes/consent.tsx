import { Meta, Title } from "@solidjs/meta";
import { AuthShell } from "@/components/auth/auth-shell";
import { ConsentView } from "@/components/consent/consent-view";
import { pageMetadata } from "@/lib/seo";

export default function ConsentPage() {
  return (
    <>
      <Title>{pageMetadata.consent.title}</Title>
      <Meta name="description" content={pageMetadata.consent.description} />
      <AuthShell
        title="Authorize Application Access"
        subtitle="Review what this app can access before you continue"
      >
        <ConsentView />
      </AuthShell>
    </>
  );
}
