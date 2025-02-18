
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Sidebar, 
  SidebarProvider, 
  SidebarContent, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarTrigger
} from './ui/sidebar';
import { User, BarChart3, LogOut, Menu, ClipboardList, Users, Calendar, Settings2, ArrowLeftRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function MainNavigation() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Get all roles codes from the user's roles
  const userRoleCodes = user?.papeis?.map(role => role.codigo) || [];
  console.log('User role codes:', userRoleCodes);

  // Check for each role type
  const isOrganizer = userRoleCodes.includes('ORE');
  const isAthlete = userRoleCodes.includes('ATL');
  const isDelegationRep = userRoleCodes.includes('RDD');
  const isPublicGeral = userRoleCodes.includes('PGR');
  const isAdmin = userRoleCodes.includes('ADM');

  useEffect(() => {
    if (location.pathname === '/') {
      console.log('MainNavigation - Initial navigation based on roles');
      if (isAthlete || isPublicGeral) {
        navigate('/athlete-profile');
      } else if (isOrganizer) {
        navigate('/organizer-dashboard');
      } else if (isDelegationRep) {
        navigate('/delegation-dashboard');
      } else if (isAdmin) {
        navigate('/administration');
      }
    }
  }, [isAthlete, isOrganizer, isDelegationRep, isPublicGeral, isAdmin, location.pathname, navigate]);

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

  // Build menu items based on user roles
  const menuItems = [
    // Profile and Schedule are available for all authenticated users
    {
      title: "Perfil",
      icon: User,
      path: "/athlete-profile"
    },
    {
      title: "Cronograma",
      icon: Calendar,
      path: "/cronograma"
    }
  ];

  // Add role-specific menu items
  if (isAthlete) {
    menuItems.push({
      title: "Minhas Inscrições",
      icon: ClipboardList,
      path: "/athlete-registrations"
    });
  }

  if (isOrganizer) {
    menuItems.push({
      title: "Organizador(a)",
      icon: BarChart3,
      path: "/organizer-dashboard"
    });
  }

  if (isDelegationRep) {
    menuItems.push({
      title: "Delegação",
      icon: Users,
      path: "/delegation-dashboard"
    });
  }

  if (isAdmin) {
    menuItems.push({
      title: "Administração",
      icon: Settings2,
      path: "/administration"
    });
  }

  const { data: userEvents } = useQuery({
    queryKey: ['user-events', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('inscricoes_eventos')
        .select(`
          evento_id,
          eventos (
            id,
            nome,
            status_evento
          )
        `)
        .eq('usuario_id', user.id);

      if (error) {
        console.error('Error fetching user events:', error);
        throw error;
      }

      return data.map(item => item.eventos);
    },
    enabled: !!user?.id
  });

  const handleEventSwitch = (eventId: string) => {
    localStorage.setItem('currentEventId', eventId);
    window.location.reload(); // Reload to refresh all queries with new event
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olimpics-green-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex flex-1 w-full">
        <Sidebar className="bg-olimpics-green-primary text-white fixed md:sticky top-16 h-[calc(100vh-4rem)] z-50">
          <SidebarHeader className="relative p-6 border-b border-olimpics-green-secondary">
            <h2 className="text-xl font-bold text-center">Menu</h2>
            <SidebarTrigger className="absolute right-4 top-1/2 -translate-y-1/2 md:hidden text-white hover:text-olimpics-green-secondary">
              <Menu className="h-6 w-6" />
            </SidebarTrigger>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-center px-4 py-2 text-sm font-medium uppercase tracking-wider text-white/70">
                Navegação
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="px-3">
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === item.path}
                        tooltip={item.title}
                        className={`
                          w-full rounded-lg transition-all duration-200
                          hover:bg-olimpics-green-secondary
                          ${location.pathname === item.path 
                            ? 'bg-olimpics-green-secondary shadow-lg' 
                            : 'hover:shadow-md'
                          }
                        `}
                      >
                        <Link to={item.path} className="flex items-center gap-3 p-3">
                          <item.icon className="h-5 w-5 flex-shrink-0" />
                          <span className="font-medium whitespace-nowrap">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="mt-auto border-t border-olimpics-green-secondary p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                {userEvents && userEvents.length > 1 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton
                        className="w-full rounded-lg p-4 flex items-center gap-3 
                          text-white hover:bg-olimpics-green-secondary/20 
                          transition-all duration-200 text-lg font-medium mb-2"
                        tooltip="Trocar Evento"
                      >
                        <ArrowLeftRight className="h-6 w-6 flex-shrink-0" />
                        <span className="whitespace-nowrap">Trocar Evento</span>
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      {userEvents.map((event: any) => (
                        <DropdownMenuItem
                          key={event.id}
                          onClick={() => handleEventSwitch(event.id)}
                          className="cursor-pointer"
                        >
                          {event.nome}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <SidebarMenuButton
                  onClick={handleLogout}
                  className="w-full rounded-lg p-4 flex items-center gap-3 
                    text-red-300 hover:text-red-100 hover:bg-red-500/20 
                    transition-all duration-200 text-lg font-medium"
                  tooltip="Sair"
                >
                  <LogOut className="h-6 w-6 flex-shrink-0" />
                  <span className="whitespace-nowrap">Sair</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 p-6 bg-olimpics-background min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}
