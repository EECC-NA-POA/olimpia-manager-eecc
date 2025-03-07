
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t md:hidden">
      <div className="grid grid-cols-5 gap-1 px-2 py-2">
        {navigationItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={cn(
              "flex flex-col items-center justify-center p-2 text-xs rounded-lg transition-colors",
              currentPath === item.path
                ? "text-olimpics-green-primary bg-olimpics-green-primary/10"
                : "text-gray-500 hover:text-olimpics-green-primary hover:bg-olimpics-green-primary/5"
            )}
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span>{item.label}</span>
          </button>
        ))}
        {userEvents && userEvents.length > 1 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex flex-col items-center justify-center p-2 text-xs text-gray-500 rounded-lg hover:text-olimpics-green-primary hover:bg-olimpics-green-primary/5">
                <ArrowLeftRight className="w-5 h-5 mb-1" />
                <span>Trocar</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mb-2" sideOffset={40}>
              {userEvents.map((event: any) => (
                <DropdownMenuItem
                  key={event.id}
                  onClick={() => onEventSwitch(event.id)}
                  className="cursor-pointer"
                >
                  {event.nome}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <button
          onClick={onLogout}
          className="flex flex-col items-center justify-center p-2 text-xs text-red-500 rounded-lg hover:bg-red-50"
        >
          <LogOut className="w-5 h-5 mb-1" />
          <span>Sair</span>
        </button>
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
  
  // If user is not logged in, don't render navigation
  if (!user) {
    return null;
  }
  
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
  
  // Pontuações - available for all roles
  navigationItems.push({
    label: "Pontuações",
    path: "/scores",
    icon: function MedalIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.11"/><path d="M15 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"/></svg>; }
  });
  
  // Role-specific items
  if (roles.isOrganizer) {
    navigationItems.push({
      label: "Organizador",
      path: "/organizer-dashboard",
      icon: function UsersIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
    });
  }
  
  if (roles.isDelegationRep) {
    navigationItems.push({
      label: "Delegação",
      path: "/delegation-dashboard",
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
  }
  
  // Default props
  const defaultProps: MobileNavigationProps = {
    navigationItems: navigationItems,
    currentPath: location.pathname,
    userEvents: [],
    onEventSwitch: (eventId: string) => {
      localStorage.setItem('currentEventId', eventId);
      window.location.reload();
    },
    onLogout: async () => {
      try {
        await signOut();
        navigate('/');
      } catch (error) {
        console.error('Error during logout:', error);
      }
    }
  };
  
  return <MobileNavigation {...defaultProps} />;
};

export default MobileNavigation;
