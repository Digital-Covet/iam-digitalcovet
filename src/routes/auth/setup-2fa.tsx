import { Meta, Title } from "@solidjs/meta";
import { useSearchParams } from "@solidjs/router";
import { AuthShell } from "@/components/auth/auth-shell";
import { TwoFactorSetup } from "@/components/auth/two-factor-setup";
import { pageMetadata } from "@/lib/seo";

export default function Setup2faPage() {
  const [params] = useSearchParams();
  const redirectTo = () =>
    typeof params.redirect === "string" ? params.redirect : null;

  return (
    <>
      <Title>{pageMetadata.setup2fa.title}</Title>
      <Meta name="description" content={pageMetadata.setup2fa.description} />
      <AuthShell
        title="Secure your account"
        subtitle="Two-factor authentication is required for Share, Portfolio, and Desk"
      >
        <TwoFactorSetup redirectTo={redirectTo()} />
      </AuthShell>
    </>
  );
}
