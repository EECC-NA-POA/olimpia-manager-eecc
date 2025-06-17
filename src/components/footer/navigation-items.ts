
import { LucideIcon } from "lucide-react";

export interface NavigationItem {
  path: string;
  label: string;
  icon: LucideIcon | ((props: any) => JSX.Element);
}

export const getNavigationItems = () => {
  // This function can be used to get navigation items
  // Currently not used but kept for potential future use
  return [];
};
