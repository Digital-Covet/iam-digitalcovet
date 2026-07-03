import type { Component } from "solid-js";
import type { UserRole } from "@/types";

const roleBadgeClasses: Record<UserRole, string> = {
  SuperAdmin: "bg-accent text-accent-foreground",
  Admin: "bg-muted text-muted-foreground border border-border",
  Employee: "bg-secondary text-secondary-foreground",
};

const RoleBadge: Component<{ role: UserRole }> = (props) => (
  <span
    class={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${roleBadgeClasses[props.role]}`}
  >
    {props.role}
  </span>
);

export default RoleBadge;
