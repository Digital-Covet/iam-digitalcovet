import type { Component } from "solid-js";
import { Show, createSignal, onMount } from "solid-js";
import { Settings } from "lucide-solid";
import AppLayout from "@/components/AppLayout";
import AuthGuard from "@/components/auth/auth-guard";
import ProfileCard from "@/components/account-settings/ProfileCard";
import SecurityCard from "@/components/account-settings/SecurityCard";
import ActiveSessionsList from "@/components/account-settings/ActiveSessionsList";
import type { UserProfile, ActiveSession } from "@/types";
import { authClient } from "@/lib/auth-client";

const AccountSettingsPage: Component = () => {
  const [loading, setLoading] = createSignal(true);
  const [user, setUser] = createSignal<UserProfile | null>(null);
  const [sessions, setSessions] = createSignal<ActiveSession[]>([]);

  onMount(() => {
    void loadData();
  });

  const loadData = async () => {
    try {
      console.log("[AccountSettings] Fetching session...");
      const sessionResult = await Promise.race([
        authClient.getSession(),
        new Promise<null>((_, reject) => setTimeout(() => reject(new Error("Session timeout")), 10000)),
      ]);
      
      const session = sessionResult?.data?.session;
      console.log("[AccountSettings] Session result:", { hasSession: !!session, userId: session?.userId });

      if (!session?.userId) {
        setLoading(false);
        return;
      }

      const userData = await fetchUser(session.userId);
      console.log("[AccountSettings] User data:", { hasUser: !!userData?.user });
      
      if (userData) {
        setUser(userData.user);
        setSessions(userData.sessions);
      }
    } catch (error) {
      console.error("[AccountSettings] Failed to load account data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async (userId: string) => {
    try {
      console.log("[AccountSettings] Fetching user data for userId:", userId);
      const response = await fetch("/api/account-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      console.log("[AccountSettings] API response status:", response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("[AccountSettings] API error:", errorText);
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error("[AccountSettings] Fetch error:", error);
      return null;
    }
  };

  return (
    <AuthGuard>
      <AppLayout>
        <div class="mb-6">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
              <Settings size={22} aria-hidden="true" class="text-primary" />
            </div>
            <div>
              <h1 class="font-heading text-2xl font-semibold tracking-tight text-foreground md:text-[2rem] md:leading-10">
                Account Settings
              </h1>
              <p class="mt-1 text-sm text-muted-foreground">
                Manage your profile, security preferences, and active sessions.
              </p>
            </div>
          </div>
        </div>

        <Show when={!loading()} fallback={<div class="text-muted-foreground">Loading...</div>}>
          <Show when={user()}>
            <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ProfileCard user={user()!} />
              <SecurityCard
                twoFactorEnabled={user()!.twoFactorEnabled}
                userId={user()!.id}
              />
            </div>

            <div class="mt-6">
              <ActiveSessionsList
                sessions={sessions()}
                currentSessionId={sessions().find((s) => s.isCurrent)?.id}
              />
            </div>
          </Show>
          <Show when={!user()}>
            <div class="text-muted-foreground">Unable to load account data.</div>
          </Show>
        </Show>
      </AppLayout>
    </AuthGuard>
  );
};

export default AccountSettingsPage;
