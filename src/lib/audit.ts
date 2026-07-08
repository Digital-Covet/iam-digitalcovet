import { prisma } from "@/db";
import type { AuditLogEvent, AuditLogTargetApp, AuditLogStatus } from "@generated/prisma/client";

function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") ?? request.headers.get("x-client-ip") ?? null;
}

function detectTargetApp(request: Request): AuditLogTargetApp {
  const origin = request.headers.get("origin") ?? request.headers.get("referer") ?? "";
  if (origin.includes("share.digitalcovet.com")) return "share";
  if (origin.includes("portfolio.digitalcovet.com")) return "portfolio";
  return "iam_system";
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface CreateAuditLogParams {
  event: AuditLogEvent;
  status: AuditLogStatus;
  request: Request;
  user?: {
    id?: string;
    name?: string;
    email?: string;
    image?: string | null;
  };
  targetApp?: AuditLogTargetApp;
}

export async function createAuditLog(params: CreateAuditLogParams) {
  const { event, status, request, user, targetApp: overrideTargetApp } = params;

  const name = user?.name ?? "Unknown";
  const email = user?.email ?? "unknown@email.com";

  await prisma.auditLog.create({
    data: {
      event,
      status,
      targetApp: overrideTargetApp ?? detectTargetApp(request),
      actorUserId: user?.id ?? null,
      actorName: name,
      actorEmail: email,
      actorAvatarUrl: user?.image ?? null,
      actorInitials: getInitials(name),
      ipAddress: getClientIp(request),
    },
  });
}
