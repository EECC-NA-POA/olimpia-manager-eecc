
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { MenuItems } from './MenuItems';
import { EventSwitcher } from './EventSwitcher';
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
      await signOut();
      toast.success('Logout realizado com sucesso!');
      navigate('/', { replace: true });
    } catch (error) {
      toast.error('Erro ao fazer logout');
    }
  };

  if (!user) {
    return null;
  }

  // Initials for avatar
  const displayName = (user as any).user_metadata?.nome_completo || user.email || '';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n: string) => n[0].toUpperCase())
    .join('');

  return (
    <Sidebar
      className="border-none shadow-xl"
      collapsible="icon"
      style={{ background: 'hsl(var(--sidebar-background))' }}
    >
      {/* Logo */}
      <SidebarHeader className="border-b p-0 flex-shrink-0" style={{ borderColor: 'hsl(var(--sidebar-border))' }}>
        <div className="flex items-center gap-3 px-4 h-16">
          <img
            src="/lovable-uploads/EECC_marca_portugues_cores_RGB.png"
            alt="EECC Logo"
            className="h-9 w-9 object-contain flex-shrink-0 brightness-0 invert"
          />
          <div className="group-data-[collapsible=icon]:hidden min-w-0 flex-1">
            <p className="text-white font-semibold text-sm leading-tight truncate">Olímpia Manager</p>
            <p className="text-white/50 text-xs leading-tight">Gestão Esportiva</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-y-auto py-2" style={{ background: 'hsl(var(--sidebar-background))' }}>
        <MenuItems onLogout={handleLogout} userId={user.id} />
      </SidebarContent>

      {/* Footer: evento ativo + avatar */}
      <SidebarFooter className="border-t p-3 flex-shrink-0 space-y-3" style={{ borderColor: 'hsl(var(--sidebar-border))', background: 'hsl(var(--sidebar-background))' }}>
        <div className="group-data-[collapsible=icon]:hidden">
          <EventSwitcher userId={user.id} collapsed={false} />
        </div>

        {/* User avatar row */}
        <div className="flex items-center gap-3 px-1">
          <div className="h-8 w-8 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0 text-white text-xs font-semibold">
            {initials || '?'}
          </div>
          <div className="group-data-[collapsible=icon]:hidden min-w-0 flex-1">
            <p className="text-white/90 text-xs font-medium truncate">{displayName}</p>
            <p className="text-white/45 text-xs truncate">{user.email}</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
