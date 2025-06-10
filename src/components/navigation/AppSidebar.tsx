
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
      {/* Logo section - sempre visível */}
      <div className="bg-olimpics-green-primary border-b border-olimpics-green-secondary/30 h-16">
        <div className="flex items-center justify-center h-full p-2 bg-olimpics-green-primary">
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

      <SidebarHeader className="border-b border-olimpics-green-secondary/30 p-4 bg-olimpics-green-primary">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white group-data-[collapsible=icon]:hidden">
            Menu Principal
          </h2>
          <SidebarTrigger className="text-white hover:bg-olimpics-green-secondary/20" />
        </div>
      </SidebarHeader>
      
      <SidebarContent className="bg-olimpics-green-primary">
        <MenuItems onLogout={handleLogout} userId={user.id} />
      </SidebarContent>
      
      <SidebarFooter className="border-t border-olimpics-green-secondary/30 p-4 bg-olimpics-green-primary">
        <div className="space-y-2">
          <div className="group-data-[collapsible=icon]:hidden">
            <EventSwitcher userId={user.id} collapsed={false} />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
