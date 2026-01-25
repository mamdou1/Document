import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

export interface SidebarProps {
  children?: ReactNode;
}

export interface SidebarItems {
  icon: LucideIcon;
  text: string;
  active?: boolean;
  alert?: boolean;
}

export interface SidebarContextType {
  expended: boolean;
}
