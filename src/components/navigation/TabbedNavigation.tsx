
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Users, Calendar, Medal, Gavel, Settings2, ClipboardList, LogOut } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useNavigation } from '@/hooks/useNavigation';
import { EventSwitcher } from './EventSwitcher';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface TabbedNavigationProps {
  user: any;
  roles: any;
}

export function TabbedNavigation({ user, roles }: TabbedNavigationProps) {
  const navigate = useNavigate();
  const { signOut } = useNavigation();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("main");
  
  // Check for specific roles
  const isJudge = user?.papeis?.some(role => role.codigo === 'JUZ') || false;
  const isAdmin = roles.isAdmin;
  const isOrganizer = roles.isOrganizer;
  const isDelegationRep = roles.isDelegationRep;
  const isAthlete = roles.isAthlete;

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logout realizado com sucesso!');
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  // Determine which tab should be active based on current route
  React.useEffect(() => {
    if (location.pathname.includes('athlete') || location.pathname === '/cronograma' || 
        location.pathname === '/scores') {
      setActiveTab('main');
    } else if (location.pathname.includes('organizer') || location.pathname.includes('delegation') || 
              location.pathname.includes('judge')) {
      setActiveTab('roles');
    } else if (location.pathname.includes('administration')) {
      setActiveTab('admin');
    }
  }, [location.pathname]);

  return (
    <div className="w-full bg-olimpics-green-primary text-white z-40 shadow-md">
      <div className="container px-4 py-1">
        <div className="flex justify-between items-center">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-olimpics-green-secondary/30 p-0.5 h-auto">
              <TabsTrigger 
                value="main" 
                className="data-[state=active]:bg-olimpics-green-secondary h-9 px-4 text-white data-[state=active]:text-white"
              >
                Principal
              </TabsTrigger>
              
              {(isOrganizer || isDelegationRep || isJudge) && (
                <TabsTrigger 
                  value="roles" 
                  className="data-[state=active]:bg-olimpics-green-secondary h-9 px-4 text-white data-[state=active]:text-white"
                >
                  Funções
                </TabsTrigger>
              )}
              
              {isAdmin && (
                <TabsTrigger 
                  value="admin" 
                  className="data-[state=active]:bg-olimpics-green-secondary h-9 px-4 text-white data-[state=active]:text-white"
                >
                  Admin
                </TabsTrigger>
              )}
            </TabsList>

            <div className="mt-2 mx-1">
              <TabsContent value="main" className="flex flex-wrap gap-1 mt-0">
                {isAthlete && (
                  <NavLink 
                    to="/athlete-profile"
                    icon={<User className="h-4 w-4" />}
                    label="Perfil"
                    isActive={location.pathname === '/athlete-profile'}
                  />
                )}
                
                <NavLink 
                  to="/cronograma"
                  icon={<Calendar className="h-4 w-4" />}
                  label="Cronograma"
                  isActive={location.pathname === '/cronograma'}
                />
                
                <NavLink 
                  to="/athlete-registrations"
                  icon={<ClipboardList className="h-4 w-4" />}
                  label="Inscrições"
                  isActive={location.pathname === '/athlete-registrations'}
                />
                
                <NavLink 
                  to="/scores"
                  icon={<Medal className="h-4 w-4" />}
                  label="Pontuações"
                  isActive={location.pathname === '/scores'}
                />
              </TabsContent>

              <TabsContent value="roles" className="flex flex-wrap gap-1 mt-0">
                {isOrganizer && (
                  <NavLink 
                    to="/organizer-dashboard"
                    icon={<Users className="h-4 w-4" />}
                    label="Organizador"
                    isActive={location.pathname === '/organizer-dashboard'}
                  />
                )}
                
                {isDelegationRep && (
                  <NavLink 
                    to="/delegation-dashboard"
                    icon={<Users className="h-4 w-4" />}
                    label="Delegação"
                    isActive={location.pathname === '/delegation-dashboard'}
                  />
                )}
                
                {isJudge && (
                  <NavLink 
                    to="/judge-dashboard"
                    icon={<Gavel className="h-4 w-4" />}
                    label="Juiz"
                    isActive={location.pathname === '/judge-dashboard'}
                  />
                )}
              </TabsContent>

              <TabsContent value="admin" className="flex flex-wrap gap-1 mt-0">
                {isAdmin && (
                  <NavLink 
                    to="/administration"
                    icon={<Settings2 className="h-4 w-4" />}
                    label="Administração"
                    isActive={location.pathname === '/administration'}
                  />
                )}
              </TabsContent>
            </div>
          </Tabs>

          <div className="flex items-center gap-2 ml-2 shrink-0">
            <EventSwitcher userId={user.id} collapsed={false} />
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-red-300 hover:text-red-100 hover:bg-red-500/20"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only sm:ml-1">Sair</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for navigation links
function NavLink({ to, icon, label, isActive }: { to: string; icon: React.ReactNode; label: string; isActive: boolean }) {
  return (
    <Link 
      to={to}
      className={`${
        isActive 
          ? 'bg-olimpics-green-secondary text-white' 
          : 'text-white/80 hover:bg-olimpics-green-secondary/40 hover:text-white'
      } flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap text-sm`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
