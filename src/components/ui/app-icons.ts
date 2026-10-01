import Briefcase from "lucide-solid/icons/briefcase";
import Layers from "lucide-solid/icons/layers";
import Share2 from "lucide-solid/icons/share-2";
import type { AppAccess, Icon } from "@/types";

export const APP_ICONS: Record<AppAccess, Icon> = {
  Share: Share2,
  Portfolio: Briefcase,
  Desk: Layers,
};
