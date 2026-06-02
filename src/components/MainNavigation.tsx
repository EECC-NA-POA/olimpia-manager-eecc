
import { useNavigation } from '@/hooks/useNavigation';
import { useState, useEffect } from 'react';
import { LoadingImage } from '@/components/ui/loading-image';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
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
        <LoadingImage />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-olimpics-background">
        <AppSidebar isHeaderVisible={isHeaderVisible} />
        <SidebarInset className="flex-1 w-full">
          {/* Botão de colapsar/expandir sidebar — visível apenas no desktop */}
          <div className="hidden md:flex items-center h-12 px-4 border-b border-border/40 sticky top-0 bg-background/95 backdrop-blur z-10">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          </div>
          <div className="main-navigation-content">
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
              {children}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
