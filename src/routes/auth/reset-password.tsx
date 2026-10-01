import { Meta, Title } from "@solidjs/meta";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { pageMetadata } from "@/lib/seo";

export default function ResetPasswordPage() {
  return (
    <>
      <Title>{pageMetadata.resetPassword.title}</Title>
      <Meta name="description" content={pageMetadata.resetPassword.description} />
      <AuthShell
        title="Choose a new password"
        subtitle="Set a strong password to regain access to your account"
      >
        <ResetPasswordForm />
      </AuthShell>
    </>
  );
}
