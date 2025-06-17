
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useNavigation } from '@/hooks/useNavigation';
import { User, Users, Calendar, Gavel, Settings2, ClipboardList, Calendar as CalendarIcon, BookOpen, LogOut, UserCheck, ClipboardCheck, BarChart3 } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupContent } from '@/components/ui/sidebar';
import { useCanCreateEvents } from '@/hooks/useCanCreateEvents';
import { useAuth } from '@/contexts/AuthContext';

interface MenuItemsProps {
  onLogout: () => void;
  userId: string;
}

export const MenuItems = ({ onLogout, userId }: MenuItemsProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { roles, user } = useNavigation();
  const { canCreateEvents } = useCanCreateEvents();
  const { setCurrentEventId } = useAuth();

  // Check for specific roles
  const isJudge = user?.papeis?.some(role => role.codigo === 'JUZ') || false;
  const isAdmin = roles.isAdmin;
  const isOrganizer = roles.isOrganizer;
  const isDelegationRep = roles.isDelegationRep;
  const isAthlete = roles.isAthlete;
  const isFilosofoMonitor = roles.isFilosofoMonitor;
  
  // Log para debug - verificando especificamente o código FMON
  console.log('MenuItems - User roles:', {
    isAdmin,
    isOrganizer,
    isDelegationRep,
    isAthlete,
    isFilosofoMonitor,
    isJudge
  });
  
  console.log('MenuItems - User papeis:', user?.papeis);
  console.log('MenuItems - User role codes:', user?.papeis?.map(role => role.codigo));
  console.log('MenuItems - Has FMON role?', user?.papeis?.some(role => role.codigo === 'FMON'));
  
  // Check if user can manage events (admin with cadastra_eventos=true)
  const canManageEvents = isAdmin && canCreateEvents;

  const handleEventSwitch = () => {
    // Clear current event and redirect to event selection
    localStorage.removeItem('currentEventId');
    setCurrentEventId(null);
    navigate('/event-selection', { replace: true });
  };

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
  
  // 3. Regulamento (Regulations) - for all roles
  menuItems.push({
    path: "/regulamento",
    label: "Regulamento",
    icon: <BookOpen className="h-5 w-5" />,
    tooltip: "Regulamento"
  });
  
  // 4. Minhas Inscrições (My Registrations) - for all roles - FIXED ROUTE
  menuItems.push({
    path: "/minhas-inscricoes",
    label: "Minhas Inscrições",
    icon: <ClipboardList className="h-5 w-5" />,
    tooltip: "Minhas Inscrições"
  });
  
  // 5. Organizador (Organizer) - FIXED ROUTE
  if (isOrganizer) {
    menuItems.push({
      path: "/organizador",
      label: "Organizador",
      icon: <Users className="h-5 w-5" />,
      tooltip: "Organizador"
    });
  }
  
  // 6. Delegação (Delegation) - FIXED ROUTE
  if (isDelegationRep) {
    menuItems.push({
      path: "/delegacao",
      label: "Delegação",
      icon: <Users className="h-5 w-5" />,
      tooltip: "Delegação"
    });
  }

  // 7. Filósofo Monitor - SEMPRE MOSTRAR SE TIVER O PAPEL
  console.log('Checking if should show Filosofo Monitor menu. isFilosofoMonitor:', isFilosofoMonitor);
  console.log('Direct check for FMON code:', user?.papeis?.some(role => role.codigo === 'FMON'));
  
  if (isFilosofoMonitor) {
    console.log('Adding Filosofo Monitor menu items');
    
    menuItems.push({
      path: "/monitor/modalidades",
      label: "Minhas Modalidades",
      icon: <UserCheck className="h-5 w-5" />,
      tooltip: "Minhas Modalidades"
    });
    
    menuItems.push({
      path: "/monitor/chamadas",
      label: "Chamadas de Presença",
      icon: <ClipboardCheck className="h-5 w-5" />,
      tooltip: "Chamadas de Presença"
    });
    
    menuItems.push({
      path: "/monitor/relatorios",
      label: "Relatórios de Presença",
      icon: <BarChart3 className="h-5 w-5" />,
      tooltip: "Relatórios de Presença"
    });
  } else {
    console.log('Not showing Filosofo Monitor menu items - user does not have the role');
    console.log('Available role codes:', user?.papeis?.map(role => role.codigo));
  }
  
  // 8. Juiz (Judge)
  if (isJudge) {
    menuItems.push({
      path: "/judge-dashboard",
      label: "Juiz",
      icon: <Gavel className="h-5 w-5" />,
      tooltip: "Juiz"
    });
  }
  
  // 9. Administração (Administration)
  if (isAdmin) {
    menuItems.push({
      path: "/administration",
      label: "Administração",
      icon: <Settings2 className="h-5 w-5" />,
      tooltip: "Administração"
    });
    
    // 10. Gerenciar Evento (Event Management) - for admins with event creation permission
    if (canManageEvents) {
      menuItems.push({
        path: "/event-management",
        label: "Gerenciar Evento",
        icon: <CalendarIcon className="h-5 w-5" />,
        tooltip: "Gerenciar Evento"
      });
    }
  }

  // 11. Trocar Evento - FIXED FUNCTIONALITY
  menuItems.push({
    path: "#",
    label: "Trocar Evento",
    icon: <CalendarIcon className="h-5 w-5" />,
    tooltip: "Trocar Evento",
    isAction: true,
    action: handleEventSwitch
  });

  // 12. Sair (Logout)
  menuItems.push({
    path: "#",
    label: "Sair",
    icon: <LogOut className="h-5 w-5" />,
    tooltip: "Sair",
    isAction: true,
    action: onLogout,
    className: "text-red-300 hover:text-red-100 hover:bg-red-500/20"
  });

  console.log('MenuItems final count:', menuItems.length);
  console.log('MenuItems:', menuItems.map(item => item.label));

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu className="space-y-1">
          {menuItems.map((item, index) => (
            <SidebarMenuItem key={item.path + index}>
              <SidebarMenuButton 
                asChild={!item.isAction}
                isActive={!item.isAction && location.pathname === item.path}
                tooltip={item.tooltip}
                className={`text-white hover:bg-olimpics-green-secondary/20 data-[active=true]:bg-olimpics-green-secondary data-[active=true]:text-white group-data-[collapsible=icon]:justify-center ${item.className || ''}`}
                onClick={item.isAction ? item.action : undefined}
              >
                {item.isAction ? (
                  <div className="flex items-center">
                    {item.icon}
                    <span className="ml-3 group-data-[collapsible=icon]:hidden">{item.label}</span>
                  </div>
                ) : (
                  <Link to={item.path} className="flex items-center">
                    {item.icon}
                    <span className="ml-3 group-data-[collapsible=icon]:hidden">{item.label}</span>
                  </Link>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
