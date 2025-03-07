
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNavigation } from '@/hooks/useNavigation';
import { User, Users, Calendar, Medal, Gavel, Settings2 } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';

export const MenuItems = ({ collapsed = false }) => {
  const location = useLocation();
  const { roles, user } = useNavigation();

  // Check if the user has the 'JUZ' (Judge) role
  const isJudge = user?.papeis?.some(role => role.codigo === 'JUZ') || false;
  const isAdmin = roles.isAdmin;

  return (
    <SidebarMenu className="flex flex-col gap-1 md:gap-2 items-start w-full">
      {user && (
        <>
          {roles.isAthlete && (
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={location.pathname === '/athlete-profile'}
                tooltip="Perfil do Atleta"
              >
                <Link to="/athlete-profile" className="w-full">
                  <User className="h-4 w-4 mr-1" />
                  <span className={collapsed ? 'hidden' : 'block'}>Perfil</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          {roles.isDelegationRep && (
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={location.pathname === '/delegation-dashboard'}
                tooltip="Delegação"
              >
                <Link to="/delegation-dashboard" className="w-full">
                  <Users className="h-4 w-4 mr-1" />
                  <span className={collapsed ? 'hidden' : 'block'}>Delegação</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          {roles.isOrganizer && (
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={location.pathname === '/organizer-dashboard'}
                tooltip="Organizador"
              >
                <Link to="/organizer-dashboard" className="w-full">
                  <Users className="h-4 w-4 mr-1" />
                  <span className={collapsed ? 'hidden' : 'block'}>Organizador</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              isActive={location.pathname === '/cronograma'}
              tooltip="Cronograma"
            >
              <Link to="/cronograma" className="w-full">
                <Calendar className="h-4 w-4 mr-1" />
                <span className={collapsed ? 'hidden' : 'block'}>Cronograma</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              isActive={location.pathname === '/scores'}
              tooltip="Pontuações"
            >
              <Link to="/scores" className="w-full">
                <Medal className="h-4 w-4 mr-1" />
                <span className={collapsed ? 'hidden' : 'block'}>Pontuações</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {isJudge && (
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={location.pathname === '/judge-dashboard'}
                tooltip="Juiz"
              >
                <Link to="/judge-dashboard" className="w-full">
                  <Gavel className="h-4 w-4 mr-1" />
                  <span className={collapsed ? 'hidden' : 'block'}>Juiz</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          {isAdmin && (
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={location.pathname === '/administration'}
                tooltip="Administração"
              >
                <Link to="/administration" className="w-full">
                  <Settings2 className="h-4 w-4 mr-1" />
                  <span className={collapsed ? 'hidden' : 'block'}>Administração</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </>
      )}
    </SidebarMenu>
  );
};
