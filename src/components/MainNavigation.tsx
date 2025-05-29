
import { Outlet } from 'react-router-dom';
import { useNavigation } from '@/hooks/useNavigation';
import { useState, useEffect } from 'react';
import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { MenuItems } from './navigation/MenuItems';
import { useIsMobile } from "@/hooks/use-mobile";

export function MainNavigation() {
  const { user } = useNavigation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();

  // Restore sidebar state from localStorage if available
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setSidebarCollapsed(savedState === 'true');
    }
  }, []);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olimpics-green-primary" />
      </div>
    );
  }

  // Don't show sidebar on mobile
  if (isMobile) {
    return (
      <div className="flex flex-col w-full">
        <div className="flex min-h-screen w-full">
          <main className="flex-1 overflow-auto bg-olimpics-background transition-all duration-200">
            <Outlet />
          </main>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={!sidebarCollapsed}>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarContent>
            <MenuItems collapsed={sidebarCollapsed} />
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 overflow-auto bg-olimpics-background transition-all duration-200">
          <div className="p-4">
            <SidebarTrigger />
          </div>
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}
