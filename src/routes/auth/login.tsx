import { Meta, Title } from "@solidjs/meta";
import { useSearchParams } from "@solidjs/router";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { pageMetadata } from "@/lib/seo";

export default function LoginPage() {
  const [params] = useSearchParams();
  const redirectTo = () =>
    typeof params.redirect === "string" ? params.redirect : null;

  return (
    <>
      <Title>{pageMetadata.login.title}</Title>
      <Meta name="description" content={pageMetadata.login.description} />
      <AuthShell
        title="Sign in to Digital Covet"
        subtitle="Centralized identity for Share, Portfolio, and Desk"
      >
        <LoginForm redirectTo={redirectTo()} />
      </AuthShell>
    </>
  );
}
