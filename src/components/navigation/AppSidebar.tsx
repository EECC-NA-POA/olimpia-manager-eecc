
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { MenuItems } from './MenuItems';
import { EventSwitcher } from './EventSwitcher';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface AppSidebarProps {
  isHeaderVisible: boolean;
}

export function AppSidebar({ isHeaderVisible }: AppSidebarProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      console.log('AppSidebar - Initiating logout process...');
      await signOut();
      console.log('AppSidebar - User signed out successfully');
      toast.success('Logout realizado com sucesso!');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('AppSidebar - Error during logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Sidebar 
      className="bg-olimpics-green-primary text-white border-none mt-16"
      collapsible="icon"
    >
      {/* Logo section that appears when header is hidden */}
      <div className={`transition-opacity duration-300 bg-olimpics-green-primary border-b border-olimpics-green-secondary/30 ${
        isHeaderVisible ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-16'
      }`}>
        <div className="flex items-center justify-center h-full p-2">
          <img 
            src="/lovable-uploads/EECC_marca_portugues_cores_RGB.png"
            alt="EECC Logo"
            className="h-10 w-auto object-contain group-data-[collapsible=icon]:h-8"
          />
          <span className="ml-2 text-white font-semibold group-data-[collapsible=icon]:hidden">
            Olímpia Manager
          </span>
        </div>
      </div>

      <SidebarHeader className="border-b border-olimpics-green-secondary/30 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white group-data-[collapsible=icon]:hidden">
            Menu Principal
          </h2>
          <SidebarTrigger className="text-white hover:bg-olimpics-green-secondary/20" />
        </div>
      </SidebarHeader>
      
      <SidebarContent className="bg-olimpics-green-primary">
        <MenuItems />
      </SidebarContent>
      
      <SidebarFooter className="border-t border-olimpics-green-secondary/30 p-4 bg-olimpics-green-primary">
        <div className="space-y-2">
          <EventSwitcher userId={user.id} collapsed={false} />
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-red-300 hover:text-red-100 hover:bg-red-500/20 group-data-[collapsible=icon]:justify-center"
            title="Sair"
          >
            <LogOut className="h-4 w-4 group-data-[collapsible=icon]:mr-0 mr-3" />
            <span className="group-data-[collapsible=icon]:hidden">Sair</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
