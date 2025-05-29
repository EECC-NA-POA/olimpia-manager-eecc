
import { Outlet } from 'react-router-dom';
import { useNavigation } from '@/hooks/useNavigation';
import { useState, useEffect } from 'react';

export function MainNavigation() {
  const { user } = useNavigation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
    <div className="flex flex-col w-full">
      <div className="flex min-h-screen w-full mt-8"> {/* Added margin-top for better spacing */}
        <main className="flex-1 overflow-auto bg-olimpics-background transition-all duration-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
