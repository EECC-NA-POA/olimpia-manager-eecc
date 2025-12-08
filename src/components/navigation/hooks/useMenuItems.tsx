
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavigation } from '@/hooks/useNavigation';
import { useCanCreateEvents } from '@/hooks/useCanCreateEvents';
import { useAuth } from '@/contexts/AuthContext';
import { User, Users, Calendar, Gavel, Settings2, ClipboardList, Calendar as CalendarIcon, BookOpen, LogOut, UserCheck, Bell, Crown, LayoutDashboard } from 'lucide-react';
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
  const isMaster = roles.isMaster;

  const handleEventSwitch = () => {
    // Clear current event and redirect to event selection
    localStorage.removeItem('currentEventId');
    setCurrentEventId(null);
    navigate('/event-selection', { replace: true });
  };

  // Memoize menu items to prevent recalculation on every render
  const menuItems: MenuItem[] = useMemo(() => {
    const items: MenuItem[] = [];
    
    // Add items in the same order as the mobile menu
    
    // 1. Meu Dashboard - for all athletes (regardless of other roles)
    if (isAthlete) {
      items.push({
        path: "/athlete-dashboard",
        label: "Dashboard",
        icon: <LayoutDashboard className="h-5 w-5" />,
        tooltip: "Dashboard"
      });
    }
    
    // 2. Cronograma (Schedule) - for all roles
    items.push({
      path: "/cronograma",
      label: "Cronograma",
      icon: <Calendar className="h-5 w-5" />,
      tooltip: "Cronograma"
    });
    
    // 3. Regulamento (Regulations) - for all roles
    items.push({
      path: "/regulamento",
      label: "Regulamento",
      icon: <BookOpen className="h-5 w-5" />,
      tooltip: "Regulamento"
    });
    
    // 4. Notificações (Notifications) - for all roles
    items.push({
      path: "/notifications",
      label: "Notificações",
      icon: <Bell className="h-5 w-5" />,
      tooltip: "Notificações"
    });
    
    // 5. Organizador (Organizer)
    if (isOrganizer) {
      items.push({
        path: "/organizador",
        label: "Organizador",
        icon: <Users className="h-5 w-5" />,
        tooltip: "Organizador"
      });
    }
    
    // 6. Delegação (Delegation)
    if (isDelegationRep) {
      items.push({
        path: "/delegacao",
        label: "Delegação",
        icon: <Users className="h-5 w-5" />,
        tooltip: "Delegação"
      });
    }

    // 7. Filósofo Monitor - ÚNICA ENTRADA NO MENU
    if (isFilosofoMonitor) {
      items.push({
        path: "/monitor",
        label: "Filósofo Monitor",
        icon: <UserCheck className="h-5 w-5" />,
        tooltip: "Filósofo Monitor"
      });
    }
    
    // 8. Juiz (Judge)
    if (isJudge) {
      items.push({
        path: "/judge-dashboard",
        label: "Juiz",
        icon: <Gavel className="h-5 w-5" />,
        tooltip: "Juiz"
      });
    }
    
    // 9. Administração (Administration) - for admins only
    if (isAdmin) {
      items.push({
        path: "/administration",
        label: "Administração",
        icon: <Settings2 className="h-5 w-5" />,
        tooltip: "Administração"
      });
    }

    // 10. Master - for master users only
    if (isMaster) {
      items.push({
        path: "/master",
        label: "Master",
        icon: <Crown className="h-5 w-5" />,
        tooltip: "Gestão Master"
      });
    }

    // 11. Perfil (Athlete Profile) - BEFORE action items
    items.push({
      path: "/athlete-profile",
      label: "Perfil",
      icon: <User className="h-5 w-5" />,
      tooltip: "Perfil do Usuário"
    });

    // 12. Trocar Evento
    items.push({
      path: "#",
      label: "Trocar Evento",
      icon: <CalendarIcon className="h-5 w-5" />,
      tooltip: "Trocar Evento",
      isAction: true,
      action: handleEventSwitch
    });

    // 13. Sair (Logout)
    items.push({
      path: "#",
      label: "Sair",
      icon: <LogOut className="h-5 w-5" />,
      tooltip: "Sair",
      isAction: true,
      action: onLogout,
      className: "text-red-300 hover:text-red-100 hover:bg-red-500/20"
    });

    return items;
  }, [isAthlete, isOrganizer, isDelegationRep, isFilosofoMonitor, isJudge, isAdmin, isMaster, onLogout]);

  return menuItems;
};
