
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { LogOut, User, Users, Calendar, Medal, Gavel, Settings2, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EventSwitcher } from './EventSwitcher';
import { toast } from 'sonner';
import { useNavigation } from '@/hooks/useNavigation';

interface TopNavigationProps {
  user: any;
  roles: any;
}

export function TopNavigation({ user, roles }: TopNavigationProps) {
  const navigate = useNavigate();
  const { signOut } = useNavigation();
  const location = useLocation();
  
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

  // Create menu items based on user roles
  const menuItems = [];
  
  // Perfil (Athlete Profile)
  if (isAthlete) {
    menuItems.push({
      path: "/athlete-profile",
      label: "Perfil",
      icon: <User className="h-5 w-5" />
    });
  }
  
  // Cronograma (Schedule)
  menuItems.push({
    path: "/cronograma",
    label: "Cronograma",
    icon: <Calendar className="h-5 w-5" />
  });
  
  // Minhas Inscrições
  menuItems.push({
    path: "/athlete-registrations",
    label: "Minhas Inscrições",
    icon: <ClipboardList className="h-5 w-5" />
  });
  
  // Pontuações
  menuItems.push({
    path: "/scores",
    label: "Pontuações",
    icon: <Medal className="h-5 w-5" />
  });
  
  // Organizador
  if (isOrganizer) {
    menuItems.push({
      path: "/organizer-dashboard",
      label: "Organizador",
      icon: <Users className="h-5 w-5" />
    });
  }
  
  // Delegação
  if (isDelegationRep) {
    menuItems.push({
      path: "/delegation-dashboard",
      label: "Delegação",
      icon: <Users className="h-5 w-5" />
    });
  }
  
  // Juiz
  if (isJudge) {
    menuItems.push({
      path: "/judge-dashboard",
      label: "Juiz",
      icon: <Gavel className="h-5 w-5" />
    });
  }
  
  // Administração
  if (isAdmin) {
    menuItems.push({
      path: "/administration",
      label: "Administração",
      icon: <Settings2 className="h-5 w-5" />
    });
  }

  return (
    <div className="w-full bg-olimpics-green-primary text-white z-40 shadow-md mt-16">
      <div className="container flex justify-between items-center p-2">
        <div className="flex items-center gap-4 overflow-x-auto flex-grow">
          {menuItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors whitespace-nowrap
                ${location.pathname === item.path 
                  ? 'bg-olimpics-green-secondary/30 text-white' 
                  : 'text-white/80 hover:bg-olimpics-green-secondary/20 hover:text-white'}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
        
        <div className="flex items-center gap-3">
          <EventSwitcher userId={user.id} collapsed={false} />
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="text-red-300 hover:text-red-100 hover:bg-red-500/20"
            title="Sair"
          >
            <LogOut className="h-5 w-5 mr-1" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
