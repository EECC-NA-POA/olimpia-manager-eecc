
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { EventSwitcher } from './EventSwitcher';
import { toast } from 'sonner';
import { useCanCreateEvents } from '@/hooks/useCanCreateEvents';
import { useAuth } from '@/contexts/AuthContext';
import { NavigationTabs } from './NavigationTabs';

interface TabbedNavigationProps {
  user: any;
  roles: any;
}

export function TabbedNavigation({ user, roles }: TabbedNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("main");
  const { canCreateEvents } = useCanCreateEvents();
  const { signOut } = useAuth();
  
  // Check for specific roles
  const isJudge = user?.papeis?.some(role => role.codigo === 'JUZ') || false;
  const isAdmin = roles.isAdmin;
  const isOrganizer = roles.isOrganizer;
  const isDelegationRep = roles.isDelegationRep;
  const isAthlete = roles.isAthlete;

  // Check if user can manage events (admin with cadastra_eventos=true)
  const canManageEvents = isAdmin && canCreateEvents;

  const handleLogout = async () => {
    try {
      console.log('TabbedNavigation - Initiating logout process...');
      await signOut();
      console.log('TabbedNavigation - User signed out successfully');
      toast.success('Logout realizado com sucesso!');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('TabbedNavigation - Error during logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  // Determine which tab should be active based on current route
  useEffect(() => {
    if (location.pathname.includes('athlete') || location.pathname === '/cronograma' || 
        location.pathname === '/scores' || location.pathname === '/regulamento') {
      setActiveTab('main');
    } else if (location.pathname.includes('organizer') || location.pathname.includes('delegation') || 
              location.pathname.includes('judge')) {
      setActiveTab('roles');
    } else if (location.pathname.includes('administration') || location.pathname.includes('event-management')) {
      setActiveTab('admin');
    }
  }, [location.pathname]);

  return (
    <div className="w-full bg-olimpics-green-primary text-white z-40 shadow-md">
      <div className="container px-4 py-1">
        <div className="flex justify-between items-center">
          <NavigationTabs 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isAdmin={isAdmin}
            isOrganizer={isOrganizer}
            isDelegationRep={isDelegationRep}
            isJudge={isJudge}
            isAthlete={isAthlete}
            canManageEvents={canManageEvents}
          />

          <div className="flex items-center gap-2 ml-2 shrink-0">
            <EventSwitcher userId={user.id} collapsed={false} />
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-red-300 hover:text-red-100 hover:bg-red-500/20"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only sm:ml-1">Sair</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
