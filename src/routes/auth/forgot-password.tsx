import { Meta, Title } from "@solidjs/meta";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { pageMetadata } from "@/lib/seo";

export default function ForgotPasswordPage() {
  return (
    <>
      <Title>{pageMetadata.forgotPassword.title}</Title>
      <Meta name="description" content={pageMetadata.forgotPassword.description} />
      <AuthShell title="Reset your password" subtitle="We'll email you a secure reset link">
        <ForgotPasswordForm />
      </AuthShell>
    </>
  );
}
