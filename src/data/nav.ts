import {
  AppWindow,
  ClipboardList,
  FingerprintPatternIcon,
  LayoutDashboard,
  Shield,
  Users,
} from "lucide-solid";
import type { AuditLogEntry, NavItem } from "@/types";

export const primaryNavItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "User Directory", icon: Users, href: "/" },
  { label: "Roles & Access", icon: Shield, href: "/roles-access" },
  { label: "Authentication", icon: FingerprintPatternIcon, href: "/auth-settings" },
  { label: "Audit Logs", icon: ClipboardList, href: "/audit-logs" },
  { label: "Apps", icon: AppWindow, href: "/apps" },
];

export const footerNavItems: NavItem[] = [];

export const auditLogEntries: AuditLogEntry[] = [];
