
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

import SocialLinks from "./footer/SocialLinks";
import { MobileNavigationLink } from "./footer/MobileNavigation";
import { VersionBadge } from "./VersionBadge";

export const Footer = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Only hide the footer on the event selection page
  const isEventSelectionPage = location.pathname === '/event-selection';

  if (isEventSelectionPage) {
    return null;
  }

  return (
    <>
      {/* Standard footer for desktop */}
      <footer className="w-full bg-white/80 backdrop-blur-sm border-t py-4 px-4 mt-auto hidden md:block">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500">
              Desenvolvido por: Olimar Teixeira Borges
            </span>
            <VersionBadge />
          </div>
          <SocialLinks />
        </div>
      </footer>
      
      {/* Mobile navigation - always render when user is logged in and not on event selection */}
      {user && !isEventSelectionPage && <MobileNavigationLink />}
    </>
  );
};

export default Footer;
