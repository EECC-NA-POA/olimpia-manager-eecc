
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

export function AppSidebar() {
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
    <Sidebar className="bg-olimpics-green-primary text-white border-none mt-16">
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
            className="w-full justify-start text-red-300 hover:text-red-100 hover:bg-red-500/20"
          >
            <LogOut className="h-4 w-4 mr-3" />
            <span className="group-data-[collapsible=icon]:hidden">Sair</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
