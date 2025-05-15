
import { Outlet } from 'react-router-dom';
import { 
  Sidebar, 
  SidebarProvider, 
  SidebarContent, 
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from './ui/sidebar';
import { ChevronLeft, ChevronRight, LogOut, Menu } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { MenuItems } from './navigation/MenuItems';
import { EventSwitcher } from './navigation/EventSwitcher';
import { useNavigation } from '@/hooks/useNavigation';
import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export function MainNavigation() {
  const navigate = useNavigate();
  const { user, roles, signOut } = useNavigation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  // Handle window resize
  useEffect(() => {
    if (isMobile && !mobileMenuOpen) {
      setSidebarCollapsed(true);
    }
  }, [isMobile]);

  const handleLogout = async () => {
    try {
      console.log('MainNavigation - Initiating logout process...');
      await signOut();
      console.log('MainNavigation - User signed out successfully');
      toast.success('Logout realizado com sucesso!');
      navigate('/');
    } catch (error) {
      console.error('MainNavigation - Error during logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olimpics-green-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={!sidebarCollapsed}>
      <div className="flex min-h-screen w-full">
        {/* Fixed sidebar background */}
        <div className={`fixed top-[64px] left-0 h-[calc(100vh-64px)] bg-[#1e293b] transition-all duration-300 z-30 
          ${isMobile ? (mobileMenuOpen ? 'w-[240px]' : 'w-0') : (sidebarCollapsed ? 'w-[70px]' : 'w-[240px]')}`} 
        />

        {/* Mobile overlay */}
        {isMobile && (
          <div 
            className={`fixed top-[64px] left-0 right-0 bottom-0 bg-black/50 z-20 transition-opacity duration-300
              ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        <Sidebar 
          className="z-40 text-white bg-transparent"
          collapsible={sidebarCollapsed ? "icon" : "none"}
          style={{
            "--sidebar-width": "240px",
            "--sidebar-width-icon": "70px",
          } as React.CSSProperties}
        >
          <SidebarHeader className="relative p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h2 className={`text-xl font-bold ${sidebarCollapsed ? 'hidden' : 'block'}`}>Menu</h2>
              {!isMobile && (
                <button 
                  onClick={toggleSidebar}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors text-white"
                  aria-label={sidebarCollapsed ? "Expandir menu" : "Recolher menu"}
                >
                  {sidebarCollapsed ? <ChevronRight className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
                </button>
              )}
            </div>
            <SidebarTrigger 
              className="absolute right-4 top-1/2 -translate-y-1/2 md:hidden text-white hover:text-white/80"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </SidebarTrigger>
          </SidebarHeader>
          <SidebarContent>
            <MenuItems collapsed={sidebarCollapsed} />
          </SidebarContent>
          <SidebarFooter className="mt-auto border-t border-white/10 p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <EventSwitcher userId={user.id} collapsed={sidebarCollapsed} />
                <SidebarMenuButton
                  onClick={handleLogout}
                  className="w-full rounded-lg p-4 flex items-center gap-3 
                    text-red-300 hover:text-red-100 hover:bg-red-500/20 
                    transition-all duration-200 text-lg font-medium"
                  tooltip={sidebarCollapsed ? "Sair" : undefined}
                >
                  <LogOut className="h-7 w-7 flex-shrink-0" />
                  <span className={`whitespace-nowrap ${sidebarCollapsed ? 'hidden' : 'block'}`}>Sair</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <main className={`flex-1 overflow-auto p-6 bg-olimpics-background transition-all duration-300
          ${isMobile ? 'w-full' : (sidebarCollapsed ? 'ml-[70px]' : 'ml-[240px]')}`}>
          <div className="content-container">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
