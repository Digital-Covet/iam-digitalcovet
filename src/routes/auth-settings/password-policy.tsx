import type { Component } from "solid-js";
import { createSignal, createMemo } from "solid-js";
import { A, query, createAsync, type RouteDefinition } from "@solidjs/router";
import { ArrowLeft } from "lucide-solid";
import AppLayout from "@/components/AppLayout";
import AuthGuard from "@/components/auth/auth-guard";
import PasswordPolicyCard from "@/components/auth-settings/PasswordPolicyCard";
import type { PasswordPolicy } from "@/types";
import { prisma } from "@/db";

const getPolicies = query(async () => {
  "use server";
  const policies = await prisma.passwordPolicy.findMany({ orderBy: { createdAt: "asc" } });
  return policies.map((p) => ({
    id: p.id,
    key: p.key,
    label: p.label,
    description: p.description,
    value: p.value as string | number | boolean,
    enabled: p.enabled,
  }));
}, "passwordPolicies");

export const route = {
  preload: () => getPolicies(),
} satisfies RouteDefinition;

const PasswordPolicyPage: Component = () => {
  const data = createAsync(() => getPolicies());

  const [policyOverrides, setPolicyOverrides] = createSignal<
    Record<string, boolean>
  >({});

  const policies = createMemo<PasswordPolicy[]>(() =>
    (data() ?? []).map((p) => ({
      ...p,
      enabled: policyOverrides()[p.id] ?? p.enabled,
    })),
  );

  const handlePolicyToggle = (id: string, enabled: boolean) => {
    setPolicyOverrides((prev) => ({ ...prev, [id]: enabled }));
  };

  return (
    <AuthGuard>
      <AppLayout>
        <div class="mb-6">
          <A
            href="/auth-settings"
            class="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Back to Authentication Settings
          </A>
        </div>

        <div class="mb-6 flex items-center gap-3">
          <div>
            <h1 class="font-heading text-2xl font-semibold tracking-tight text-foreground md:text-[2rem] md:leading-10">
              Password Policy
            </h1>
            <p class="mt-1 text-sm text-muted-foreground">
              Define complexity requirements and rotation rules for user passwords.
            </p>
          </div>
        </div>

        <PasswordPolicyCard
          policies={policies()}
          onToggle={handlePolicyToggle}
        />
      </AppLayout>
    </AuthGuard>
  );
};

export default PasswordPolicyPage;