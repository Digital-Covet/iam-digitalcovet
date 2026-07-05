import { Meta, Title } from "@solidjs/meta";
import { useSearchParams } from "@solidjs/router";
import TwoFactorVerify from "@/components/auth/two-factor-verify";
import { pageMetadata } from "@/lib/seo";

export default function Verify2FAPage() {
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.redirect;
  const redirectTo = Array.isArray(redirectParam) ? redirectParam[0] : redirectParam;

	return (
		<>
			<Title>{pageMetadata.verify2fa.title}</Title>
			<Meta name="description" content={pageMetadata.verify2fa.description} />
      <div class="flex min-h-screen items-center justify-center p-4">
        <div class="w-full max-w-md space-y-6 p-8 shadow-md">
          <div class="text-center">
            <h1 class="text-2xl font-bold tracking-tight">
              Two-Factor Authentication
            </h1>
            <p class="mt-2 text-sm">
              Enter your security code to complete sign-in.
            </p>
          </div>
          <TwoFactorVerify redirectTo={redirectTo || "/dashboard"} />
        </div>
      </div>
    </>
  );
}
