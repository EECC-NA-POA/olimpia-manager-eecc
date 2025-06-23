
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavigation } from '@/hooks/useNavigation';
import { useCanCreateEvents } from '@/hooks/useCanCreateEvents';
import { useAuth } from '@/contexts/AuthContext';
import { User, Users, Calendar, Gavel, Settings2, ClipboardList, Calendar as CalendarIcon, BookOpen, LogOut, UserCheck } from 'lucide-react';
import { MenuItem } from '../types';

export const useMenuItems = (onLogout: () => void) => {
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

  const handleEventSwitch = () => {
    // Clear current event and redirect to event selection
    localStorage.removeItem('currentEventId');
    setCurrentEventId(null);
    navigate('/event-selection', { replace: true });
  };

  const menuItems: MenuItem[] = [];
  
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
  
  // 4. Minhas Inscrições (My Registrations) - for all roles
  menuItems.push({
    path: "/minhas-inscricoes",
    label: "Minhas Inscrições",
    icon: <ClipboardList className="h-5 w-5" />,
    tooltip: "Minhas Inscrições"
  });
  
  // 5. Organizador (Organizer)
  if (isOrganizer) {
    menuItems.push({
      path: "/organizador",
      label: "Organizador",
      icon: <Users className="h-5 w-5" />,
      tooltip: "Organizador"
    });
  }
  
  // 6. Delegação (Delegation)
  if (isDelegationRep) {
    menuItems.push({
      path: "/delegacao",
      label: "Delegação",
      icon: <Users className="h-5 w-5" />,
      tooltip: "Delegação"
    });
  }

  // 7. Filósofo Monitor - ÚNICA ENTRADA NO MENU
  if (isFilosofoMonitor) {
    menuItems.push({
      path: "/monitor",
      label: "Filósofo Monitor",
      icon: <UserCheck className="h-5 w-5" />,
      tooltip: "Filósofo Monitor"
    });
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
  
  // 9. Administração (Administration) - for admins only
  if (isAdmin) {
    menuItems.push({
      path: "/administration",
      label: "Administração",
      icon: <Settings2 className="h-5 w-5" />,
      tooltip: "Administração"
    });
  }

  // 10. Trocar Evento
  menuItems.push({
    path: "#",
    label: "Trocar Evento",
    icon: <CalendarIcon className="h-5 w-5" />,
    tooltip: "Trocar Evento",
    isAction: true,
    action: handleEventSwitch
  });

  // 11. Sair (Logout)
  menuItems.push({
    path: "#",
    label: "Sair",
    icon: <LogOut className="h-5 w-5" />,
    tooltip: "Sair",
    isAction: true,
    action: onLogout,
    className: "text-red-300 hover:text-red-100 hover:bg-red-500/20"
  });

  return menuItems;
};
