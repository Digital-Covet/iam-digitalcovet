import type { APIEvent } from "@solidjs/start/server";
import { prisma } from "@/db";

const roleLabels: Record<string, string> = {
  employee: "Employee",
  admin: "Admin",
  superadmin: "SuperAdmin",
};

export const POST = async (event: APIEvent) => {
  try {
    const body = await event.request.json();
    const { userId } = body;

    if (!userId) {
      return new Response(JSON.stringify({ error: "userId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        sessions: {
          where: { expiresAt: { gt: new Date() } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const activeSessions = user.sessions.map((s) => {
      const ua = s.userAgent ?? "";
      const deviceMatch = ua.match(/\(([^)]+)\)/);
      const device = deviceMatch ? deviceMatch[1].split(";")[0] : "Unknown Device";
      const browserMatch = ua.match(/(Chrome|Firefox|Safari|Edge|Opera|Arc)\/[\d.]+/);
      const browser = browserMatch ? browserMatch[0] : "Unknown Browser";

      return {
        id: s.id,
        userName: user.name,
        userEmail: user.email,
        userInitials: user.initials ?? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase(),
        userAvatarUrl: user.image ?? undefined,
        device,
        browser,
        ipAddress: s.ipAddress ?? "N/A",
        location: s.location ?? "Unknown",
        loginTime: s.createdAt.toISOString(),
        lastActivity: s.lastActivity?.toISOString() ?? s.createdAt.toISOString(),
        isCurrent: false,
      };
    });

    return new Response(
      JSON.stringify({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          initials: user.initials ?? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase(),
          role: (roleLabels[user.role] ?? user.role) as "Employee" | "Admin" | "SuperAdmin",
          department: user.departmentId,
          avatarUrl: user.image,
          twoFactorEnabled: user.twoFactorEnabled ?? false,
          createdAt: user.createdAt.toISOString(),
        },
        sessions: activeSessions,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Account settings API error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
