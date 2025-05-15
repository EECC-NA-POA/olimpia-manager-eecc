
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { getNavigationItems } from "./footer/navigation-items";
import SocialLinks from "./footer/SocialLinks";
import MobileNavigation from "./footer/MobileNavigation";

export const Footer = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const userRoles = user?.papeis || [];
  const navigationItems = getNavigationItems(userRoles);

  const { data: userEvents } = useQuery({
    queryKey: ['user-events', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
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
        .eq('usuario_id', user.id);

      if (error) {
        console.error('Error fetching user events:', error);
        throw error;
      }

      return data.map(item => item.eventos);
    },
    enabled: !!user?.id
  });

  const handleEventSwitch = (eventId: string) => {
    localStorage.setItem('currentEventId', eventId);
    window.location.reload();
  };

  const handleLogout = async () => {
    try {
      console.log('Initiating logout process...');
      await signOut();
      console.log('User signed out successfully');
      toast.success('Logout realizado com sucesso!');
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  const filteredNavItems = navigationItems.filter(item => 
    item.roles.some(roleCode => userRoles.some(userRole => userRole.codigo === roleCode))
  );

  // Only hide the footer on the event selection page
  const isEventSelectionPage = location.pathname === '/event-selection';

  if (isEventSelectionPage) {
    return null;
  }

  return (
    <>
      {isMobile && (
        <MobileNavigation
          navigationItems={filteredNavItems}
          currentPath={location.pathname}
          userEvents={userEvents || []}
          onEventSwitch={handleEventSwitch}
          onLogout={handleLogout}
        />
      )}
      {/* Always render the standard footer */}
      <footer className="w-full bg-white/80 backdrop-blur-sm border-t py-4 px-4 mt-auto">
        <div className="container mx-auto flex justify-between items-center">
          <span className="text-xs text-gray-500">
            Desenvolvido por: Olimar Teixeira Borges
          </span>
          <SocialLinks />
        </div>
      </footer>
    </>
  );
};

export default Footer;
