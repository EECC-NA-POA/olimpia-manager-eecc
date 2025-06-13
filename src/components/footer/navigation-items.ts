
import { Settings, User, Calendar, ClipboardList, Users, Settings2 } from "lucide-react";
import { UserRole } from "@/types/auth";

export interface NavigationItem {
  icon: any;
  label: string;
  path: string;
  roles: string[];
}

export const getNavigationItems = (userRoles: UserRole[]) => {
  // Base navigation items that should appear for all authenticated users
  const navigationItems: NavigationItem[] = [
    {
      icon: User,
      label: "Perfil",
      path: "/athlete-profile",
      roles: ["ATL", "ORE", "RDD", "ADM"], // Available for all roles
    },
    {
      icon: Calendar,
      label: "Cronograma",
      path: "/cronograma",
      roles: ["ATL", "ORE", "RDD", "ADM"], // Available for all roles
    },
    {
      icon: ClipboardList,
      label: "Minhas Inscrições",
      path: "/athlete-registrations",
      roles: ["ATL", "ORE", "RDD", "ADM"], // Available for all roles
    }
  ];

  // Only add role-specific items if we have valid roles
  if (userRoles && userRoles.length > 0) {
    // Add organizer-specific items
    if (userRoles.some(role => role.codigo === "ORE")) {
      navigationItems.push({
        icon: Settings,
        label: "Organizador(a)",
        path: "/organizer-dashboard",
        roles: ["ORE"],
      });
    }

    // Add delegation-specific items
    if (userRoles.some(role => role.codigo === "RDD")) {
      navigationItems.push({
        icon: Users,
        label: "Delegação",
        path: "/delegation-dashboard",
        roles: ["RDD"],
      });
    }

    // Add admin-specific items
    if (userRoles.some(role => role.codigo === "ADM")) {
      navigationItems.push({
        icon: Settings2,
        label: "Administração",
        path: "/administration",
        roles: ["ADM"],
      });
    }
  }

  return navigationItems;
};
