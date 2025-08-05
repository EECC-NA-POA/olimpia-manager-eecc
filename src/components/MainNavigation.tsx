
import { useNavigation } from '@/hooks/useNavigation';
import { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './navigation/AppSidebar';

interface MainNavigationProps {
  children: React.ReactNode;
}

export function MainNavigation({ children }: MainNavigationProps) {
  const { user } = useNavigation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Monitor scroll for header visibility
  useEffect(() => {
    const controlHeader = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
          setIsHeaderVisible(false);
        } else {
          setIsHeaderVisible(true);
        }
        setLastScrollY(window.scrollY);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlHeader);
      return () => {
        window.removeEventListener('scroll', controlHeader);
      };
    }
  }, [lastScrollY]);

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

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar isHeaderVisible={isHeaderVisible} />
        <SidebarInset className="flex-1">
          <main className="flex-1 overflow-auto bg-olimpics-background p-6 pt-20">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
