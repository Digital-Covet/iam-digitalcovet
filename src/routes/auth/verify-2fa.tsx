import { Meta, Title } from "@solidjs/meta";
import { useSearchParams } from "@solidjs/router";
import { AuthShell } from "@/components/auth/auth-shell";
import { TwoFactorVerify } from "@/components/auth/two-factor-verify";
import { pageMetadata } from "@/lib/seo";

export default function Verify2faPage() {
  const [params] = useSearchParams();
  const redirectTo = () =>
    typeof params.redirect === "string" ? params.redirect : null;

  return (
    <>
      <Title>{pageMetadata.verify2fa.title}</Title>
      <Meta name="description" content={pageMetadata.verify2fa.description} />
      <AuthShell
        title="Verify your identity"
        subtitle="One more step to access Share, Portfolio, and Desk"
      >
        <TwoFactorVerify redirectTo={redirectTo()} />
      </AuthShell>
    </>
  );
}
