
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNavigation } from '@/hooks/useNavigation';
import { User, Users, Calendar, Medal, Gavel, Settings2, ClipboardList, Calendar as CalendarIcon } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { useCanCreateEvents } from '@/hooks/useCanCreateEvents';

export const MenuItems = ({ collapsed = false }) => {
  const location = useLocation();
  const { roles, user } = useNavigation();
  const { canCreateEvents } = useCanCreateEvents();

  // Check for specific roles
  const isJudge = user?.papeis?.some(role => role.codigo === 'JUZ') || false;
  const isAdmin = roles.isAdmin;
  const isOrganizer = roles.isOrganizer;
  const isDelegationRep = roles.isDelegationRep;
  const isAthlete = roles.isAthlete;
  
  // Check if user can manage events (admin with cadastra_eventos=true)
  const canManageEvents = isAdmin && canCreateEvents;

  const menuItems = [];
  
  // Add items in the same order as the mobile menu
  
  // 1. Perfil (Athlete Profile) - only for athletes
  if (isAthlete) {
    menuItems.push({
      path: "/athlete-profile",
      label: "Perfil",
      icon: <User className="h-7 w-7" />,
      tooltip: "Perfil do Atleta"
    });
  }
  
  // 2. Cronograma (Schedule) - for all roles
  menuItems.push({
    path: "/cronograma",
    label: "Cronograma",
    icon: <Calendar className="h-7 w-7" />,
    tooltip: "Cronograma"
  });
  
  // 3. Minhas Inscrições (My Registrations) - for all roles
  menuItems.push({
    path: "/athlete-registrations",
    label: "Minhas Inscrições",
    icon: <ClipboardList className="h-7 w-7" />,
    tooltip: "Minhas Inscrições"
  });
  
  // 4. Pontuações (Scores) - for all roles
  menuItems.push({
    path: "/scores",
    label: "Pontuações",
    icon: <Medal className="h-7 w-7" />,
    tooltip: "Pontuações"
  });
  
  // 5. Organizador (Organizer)
  if (isOrganizer) {
    menuItems.push({
      path: "/organizer-dashboard",
      label: "Organizador",
      icon: <Users className="h-7 w-7" />,
      tooltip: "Organizador"
    });
  }
  
  // 6. Delegação (Delegation)
  if (isDelegationRep) {
    menuItems.push({
      path: "/delegation-dashboard",
      label: "Delegação",
      icon: <Users className="h-7 w-7" />,
      tooltip: "Delegação"
    });
  }
  
  // 7. Juiz (Judge)
  if (isJudge) {
    menuItems.push({
      path: "/judge-dashboard",
      label: "Juiz",
      icon: <Gavel className="h-7 w-7" />,
      tooltip: "Juiz"
    });
  }
  
  // 8. Administração (Administration)
  if (isAdmin) {
    menuItems.push({
      path: "/administration",
      label: "Administração",
      icon: <Settings2 className="h-7 w-7" />,
      tooltip: "Administração"
    });
    
    // 9. Gerenciar Evento (Event Management) - for admins with event creation permission
    if (canManageEvents) {
      menuItems.push({
        path: "/event-management",
        label: "Gerenciar Evento",
        icon: <CalendarIcon className="h-7 w-7" />,
        tooltip: "Gerenciar Evento"
      });
    }
  }

  return (
    <SidebarMenu className="flex flex-col gap-1 md:gap-2 items-start w-full px-2 py-2">
      {menuItems.map((item) => (
        <SidebarMenuItem key={item.path}>
          <SidebarMenuButton 
            asChild 
            isActive={location.pathname === item.path}
            tooltip={collapsed ? item.tooltip : undefined}
            className="p-3 text-base hover:bg-olimpics-green-secondary/20"
          >
            <Link to={item.path} className="w-full flex items-center text-base">
              {React.cloneElement(item.icon, { className: "h-7 w-7 mr-3 flex-shrink-0" })}
              <span className={collapsed ? 'hidden' : 'block text-lg'}>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
};
