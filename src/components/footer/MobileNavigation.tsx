
import { ArrowLeftRight, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { NavigationItem } from "./navigation-items";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigation } from "@/hooks/useNavigation";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface MobileNavigationProps {
  navigationItems: NavigationItem[];
  currentPath: string;
  userEvents: any[];
  onEventSwitch: (eventId: string) => void;
  onLogout: () => void;
}

const MobileNavigation = ({
  navigationItems,
  currentPath,
  userEvents,
  onEventSwitch,
  onLogout,
}: MobileNavigationProps) => {
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg md:hidden">
      <div className="grid grid-cols-5 gap-1 px-2 py-2">
        {navigationItems.slice(0, 4).map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={cn(
              "flex flex-col items-center justify-center p-2 text-xs rounded-lg transition-colors min-h-[60px]",
              currentPath === item.path
                ? "text-olimpics-green-primary bg-olimpics-green-primary/10"
                : "text-gray-500 hover:text-olimpics-green-primary hover:bg-olimpics-green-primary/5"
            )}
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span className="text-center leading-tight">{item.label}</span>
          </button>
        ))}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex flex-col items-center justify-center p-2 text-xs text-gray-500 rounded-lg hover:text-olimpics-green-primary hover:bg-olimpics-green-primary/5 min-h-[60px]">
              <ArrowLeftRight className="w-5 h-5 mb-1" />
              <span className="text-center leading-tight">Mais</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mb-2 bg-white shadow-lg border" sideOffset={40}>
            {/* Extra menu items that didn't fit */}
            {navigationItems.slice(4).map((item) => (
              <DropdownMenuItem
                key={item.path}
                onClick={() => navigate(item.path)}
                className="cursor-pointer"
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </DropdownMenuItem>
            ))}
            
            {/* Event switching */}
            {userEvents && userEvents.length > 1 && (
              <>
                <DropdownMenuItem className="font-medium cursor-default text-muted-foreground">
                  Alterar Evento
                </DropdownMenuItem>
                {userEvents.map((event: any) => (
                  <DropdownMenuItem
                    key={event.id}
                    onClick={() => onEventSwitch(event.id)}
                    className="cursor-pointer ml-2"
                  >
                    {event.nome}
                  </DropdownMenuItem>
                ))}
              </>
            )}
            
            {/* Logout option */}
            <DropdownMenuItem
              onClick={onLogout}
              className="cursor-pointer text-red-500 hover:text-red-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

// Export MobileNavigationLink for compatibility with existing code
export const MobileNavigationLink = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { roles } = useNavigation();
  
  // Always call hooks unconditionally - use enabled to control execution
  const { data: userEvents = [] } = useQuery({
    queryKey: ['user-events', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inscricoes_eventos')
        .select(`
          evento_id,
          eventos (
            id,
            nome,
            status_evento
          )
        `)
        .eq('usuario_id', user!.id);

      if (error) {
        console.error('Error fetching user events:', error);
        throw error;
      }

      return data.map(item => item.eventos);
    },
    enabled: !!user?.id && location.pathname !== '/event-selection'
  });
  
  // Always call this hook - use enabled to control execution
  const { data: canCreateEvents } = useQuery({
    queryKey: ['can-create-events', user?.id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .rpc('verificar_permissao_criacao_evento');
        
        if (error) throw error;
        return !!data;
      } catch (error) {
        console.error('Error checking event creation permission:', error);
        return false;
      }
    },
    enabled: !!user?.id && roles.isAdmin && location.pathname !== '/event-selection'
  });
  
  // Don't show mobile navigation on event selection page or when no user
  if (!user || location.pathname === '/event-selection') {
    return null;
  }
  
  // Handle logout reliably
  const handleLogout = async () => {
    try {
      console.log('MobileNavigation - Handling logout');
      localStorage.removeItem('currentEventId');
      await signOut();
      toast.success('Logout realizado com sucesso!');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('MobileNavigation - Error during logout:', error);
      toast.error("Erro ao fazer logout");
    }
  };

  // Define navigation items to match desktop menu order
  const navigationItems = [];
  
  // Check for each role type and add corresponding items in same order as desktop
  if (roles.isAthlete) {
    navigationItems.push({
      label: "Perfil",
      path: "/athlete-profile",
      icon: function UserIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
    });
  }
  
  // Cronograma - available for all roles
  navigationItems.push({
    label: "Cronograma",
    path: "/cronograma",
    icon: function CalendarIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>; }
  });
  
  // Regulamento - available for all roles
  navigationItems.push({
    label: "Regulamento",
    path: "/regulamento",
    icon: function BookIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>; }
  });
  
  // Minhas Inscrições - available for all roles
  navigationItems.push({
    label: "Inscrições",
    path: "/minhas-inscricoes",
    icon: function ClipboardIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z"/></svg>; }
  });
  
  // Role-specific items
  if (roles.isOrganizer) {
    navigationItems.push({
      label: "Organizador",
      path: "/organizador",
      icon: function UsersIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
    });
  }
  
  if (roles.isDelegationRep) {
    navigationItems.push({
      label: "Delegação",
      path: "/delegacao",
      icon: function UsersIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
    });
  }
  
  if (roles.isJudge) {
    navigationItems.push({
      label: "Juiz",
      path: "/judge-dashboard",
      icon: function GavelIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m14 13-7.5 7.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L11 10"/><path d="m16 16 6-6"/><path d="m8 8 6-6"/><path d="m9 7 8 8"/><path d="m21 11-8-8"/></svg>; }
    });
  }
  
  if (roles.isAdmin) {
    navigationItems.push({
      label: "Administração",
      path: "/administration",
      icon: function SettingsIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>; }
    });
    
    if (roles.isAdmin && canCreateEvents) {
      navigationItems.push({
        label: "Gerenciar Evento",
        path: "/event-management",
        icon: function CalendarIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>; }
      });
    }
  }
  
  // Default props
  const defaultProps = {
    navigationItems: navigationItems,
    currentPath: location.pathname,
    userEvents: userEvents || [],
    onEventSwitch: (eventId: string) => {
      localStorage.setItem('currentEventId', eventId);
      window.location.reload();
    },
    onLogout: handleLogout // Use our consistent logout handler
  };
  
  return <MobileNavigation {...defaultProps} />;
};

export default MobileNavigation;
