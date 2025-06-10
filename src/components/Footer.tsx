
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

  // Only hide the footer on the event selection page
  const isEventSelectionPage = location.pathname === '/event-selection';

  if (isEventSelectionPage) {
    return null;
  }

  // Always render the standard footer, mobile navigation is handled by MobileNavigationLink
  return (
    <footer className="w-full bg-white/80 backdrop-blur-sm border-t py-4 px-4 mt-auto">
      <div className="container mx-auto flex justify-between items-center">
        <span className="text-xs text-gray-500">
          Desenvolvido por: Olimar Teixeira Borges
        </span>
        <SocialLinks />
      </div>
    </footer>
  );
};

export default Footer;
