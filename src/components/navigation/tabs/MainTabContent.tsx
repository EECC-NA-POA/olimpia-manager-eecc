
import React from 'react';
import { useLocation } from 'react-router-dom';
import { User, Calendar, BookOpen, ClipboardList, Medal } from 'lucide-react';
import { NavLink } from '../NavLink';

interface MainTabContentProps {
  isAthlete: boolean;
}

export function MainTabContent({ isAthlete }: MainTabContentProps) {
  const location = useLocation();
  
  return (
    <>
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
        to="/regulamento"
        icon={<BookOpen className="h-4 w-4" />}
        label="Regulamento"
        isActive={location.pathname === '/regulamento'}
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
    </>
  );
}
