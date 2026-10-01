import FileText from "lucide-solid/icons/file-text";
import KeyRound from "lucide-solid/icons/key-round";
import LayoutGrid from "lucide-solid/icons/layout-grid";
import Settings from "lucide-solid/icons/settings";
import ShieldCheck from "lucide-solid/icons/shield-check";
import Users from "lucide-solid/icons/users";
import { ROUTES } from "@/lib/constants";
import type { NavItem } from "@/types";

export const NAV_ITEMS: readonly NavItem[] = [
  { label: "Dashboard", href: ROUTES.DASHBOARD, icon: LayoutGrid },
  { label: "User Directory", href: "/", icon: Users },
  { label: "Applications", href: "/apps", icon: ShieldCheck },
  { label: "Roles & RBAC", href: "/roles-access", icon: KeyRound },
  { label: "Audit Logs", href: "/audit-logs", icon: FileText },
  { label: "Auth Policies", href: "/auth-settings", icon: Settings },
];
