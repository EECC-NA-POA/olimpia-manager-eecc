
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
import { TopNavigation } from './navigation/TopNavigation';

export function MainNavigation() {
  const navigate = useNavigate();
  const { user, roles, signOut } = useNavigation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Restore sidebar state from localStorage if available
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setSidebarCollapsed(savedState === 'true');
    }
  }, []);

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
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', newState.toString());
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olimpics-green-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {/* Top Navigation Bar */}
      <TopNavigation user={user} roles={roles} />
      
      <div className="flex min-h-screen w-full">
        <main className="flex-1 overflow-auto bg-olimpics-background transition-all duration-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
