
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNavigation } from '@/hooks/useNavigation';
import { User, Users, Calendar, Medal, Gavel, Settings2, ClipboardList } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';

export const MenuItems = ({ collapsed = false }) => {
  const location = useLocation();
  const { roles, user } = useNavigation();

  // Check for specific roles
  const isJudge = user?.papeis?.some(role => role.codigo === 'JUZ') || false;
  const isAdmin = roles.isAdmin;
  const isOrganizer = roles.isOrganizer;
  const isDelegationRep = roles.isDelegationRep;
  const isAthlete = roles.isAthlete;

  const menuItems = [];
  
  // Add items in the same order as the mobile menu
  
  // 1. Perfil (Athlete Profile) - only for athletes
  if (isAthlete) {
    menuItems.push({
      path: "/athlete-profile",
      label: "Perfil",
      icon: <User className="h-5 w-5" />,
      tooltip: "Perfil do Atleta"
    });
  }
  
  // 2. Cronograma (Schedule) - for all roles
  menuItems.push({
    path: "/cronograma",
    label: "Cronograma",
    icon: <Calendar className="h-5 w-5" />,
    tooltip: "Cronograma"
  });
  
  // 3. Minhas Inscrições (My Registrations) - for all roles
  menuItems.push({
    path: "/athlete-registrations",
    label: "Minhas Inscrições",
    icon: <ClipboardList className="h-5 w-5" />,
    tooltip: "Minhas Inscrições"
  });
  
  // 4. Pontuações (Scores) - for all roles
  menuItems.push({
    path: "/scores",
    label: "Pontuações",
    icon: <Medal className="h-5 w-5" />,
    tooltip: "Pontuações"
  });
  
  // 5. Organizador (Organizer)
  if (isOrganizer) {
    menuItems.push({
      path: "/organizer-dashboard",
      label: "Organizador",
      icon: <Users className="h-5 w-5" />,
      tooltip: "Organizador"
    });
  }
  
  // 6. Delegação (Delegation)
  if (isDelegationRep) {
    menuItems.push({
      path: "/delegation-dashboard",
      label: "Delegação",
      icon: <Users className="h-5 w-5" />,
      tooltip: "Delegação"
    });
  }
  
  // 7. Juiz (Judge)
  if (isJudge) {
    menuItems.push({
      path: "/judge-dashboard",
      label: "Juiz",
      icon: <Gavel className="h-5 w-5" />,
      tooltip: "Juiz"
    });
  }
  
  // 8. Administração (Administration)
  if (isAdmin) {
    menuItems.push({
      path: "/administration",
      label: "Administração",
      icon: <Settings2 className="h-5 w-5" />,
      tooltip: "Administração"
    });
  }

  return (
    <SidebarMenu className="flex flex-col gap-1 w-full pt-2">
      {menuItems.map((item) => (
        <SidebarMenuItem key={item.path}>
          <SidebarMenuButton 
            asChild 
            isActive={location.pathname === item.path}
            tooltip={collapsed ? item.tooltip : undefined}
            className={`p-3 hover:bg-white/10 ${location.pathname === item.path ? 'bg-white/20' : ''}`}
          >
            <Link to={item.path} className="w-full flex items-center text-sm font-medium">
              <span className="w-5 h-5 flex items-center justify-center mr-3">
                {item.icon}
              </span>
              <span className={collapsed ? 'hidden' : 'block'}>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
};
