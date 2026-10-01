import { query } from "@solidjs/router";
import { loadDashboardData } from "@/lib/dashboard-data";

export const getDashboardData = query(() => loadDashboardData(), "dashboardData");
