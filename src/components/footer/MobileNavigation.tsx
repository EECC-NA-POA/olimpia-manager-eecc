
import { ArrowLeftRight, MoreHorizontal } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useMenuItems } from "@/components/navigation/hooks/useMenuItems";
import { MenuItem } from "@/components/navigation/types";

interface MobileNavigationProps {
  menuItems: MenuItem[];
  currentPath: string;
}

const MobileNavigation = ({ menuItems, currentPath }: MobileNavigationProps) => {
  const navigate = useNavigate();

  // Separate regular items from action items
  const regularItems = menuItems.filter(item => !item.isAction);
  const actionItems = menuItems.filter(item => item.isAction);

  // Prioritize items for mobile: first 4 slots go to most used items
  const prioritizedItems = [
    ...regularItems.filter(item => 
      item.path === "/athlete-profile" || 
      item.path === "/cronograma" || 
      item.path === "/notifications" || 
      item.path === "/minhas-inscricoes"
    ),
    ...regularItems.filter(item => 
      item.path !== "/athlete-profile" && 
      item.path !== "/cronograma" && 
      item.path !== "/notifications" && 
      item.path !== "/minhas-inscricoes"
    )
  ];

  const fixedItems = prioritizedItems.slice(0, 4);
  const dropdownItems = prioritizedItems.slice(4);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-border shadow-[0_-2px_16px_rgba(0,0,0,0.06)] md:hidden safe-area-inset-bottom">
      <div className="grid grid-cols-5 gap-0.5 px-1 py-1.5">
        {fixedItems.map((item) => (
          <button
            key={item.path}
            onClick={() => item.isAction ? item.action?.() : navigate(item.path)}
            className={cn(
              "flex flex-col items-center justify-center py-2 px-1 text-[10px] rounded-xl transition-all duration-150 min-h-[56px] gap-1",
              currentPath === item.path
                ? "text-[hsl(142,100%,30%)] bg-[hsl(142,40%,93%)] font-medium"
                : "text-muted-foreground hover:text-[hsl(142,100%,30%)] hover:bg-[hsl(142,40%,96%)]"
            )}
          >
            {item.icon}
            <span className="text-center leading-tight">{item.label}</span>
          </button>
        ))}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex flex-col items-center justify-center py-2 px-1 text-[10px] text-muted-foreground rounded-xl hover:text-[hsl(142,100%,30%)] hover:bg-[hsl(142,40%,96%)] min-h-[56px] gap-1 transition-all duration-150">
              <MoreHorizontal className="w-5 h-5" />
              <span className="text-center leading-tight">Mais</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mb-2 shadow-lg rounded-xl border" sideOffset={40}>
            {/* Extra regular menu items that didn't fit */}
            {dropdownItems.map((item) => (
              <DropdownMenuItem
                key={item.path}
                onClick={() => item.isAction ? item.action?.() : navigate(item.path)}
                className={cn("cursor-pointer", item.className)}
              >
                {item.icon}
                <span className="ml-2">{item.label}</span>
              </DropdownMenuItem>
            ))}
            
            {/* Action items (Trocar Evento, Sair) */}
            {actionItems.map((item) => (
              <DropdownMenuItem
                key={item.path}
                onClick={item.action}
                className={cn("cursor-pointer", item.className)}
              >
                {item.icon}
                <span className="ml-2">{item.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

// Export MobileNavigationLink for compatibility with existing code
export const MobileNavigationLink = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Public routes that should not show the mobile navigation
  const publicRoutes = ['/event-selection', '/torneio-concordia', '/'];
  
  // Don't show mobile navigation on public pages or when no user
  if (!user || publicRoutes.includes(location.pathname)) {
    return null;
  }
  
  // Handle logout reliably
  const handleLogout = async () => {
    try {
      console.log('MobileNavigation - Handling logout');
      localStorage.removeItem('currentEventId');
      toast.success('Logout realizado com sucesso!');
      window.location.href = '/';
    } catch (error) {
      console.error('MobileNavigation - Error during logout:', error);
      toast.error("Erro ao fazer logout");
    }
  };

  // Use the same menu items logic as desktop
  const menuItems = useMenuItems(handleLogout);
  
  return <MobileNavigation menuItems={menuItems} currentPath={location.pathname} />;
};

export default MobileNavigation;
