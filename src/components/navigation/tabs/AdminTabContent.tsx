
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Settings2, Calendar as CalendarIcon } from 'lucide-react';
import { NavLink } from '../NavLink';

interface AdminTabContentProps {
  isAdmin: boolean;
  canManageEvents: boolean;
}

export function AdminTabContent({ isAdmin, canManageEvents }: AdminTabContentProps) {
  const location = useLocation();
  
  if (!isAdmin) return null;
  
  return (
    <>
      <NavLink 
        to="/administration"
        icon={<Settings2 className="h-4 w-4" />}
        label="Administração"
        isActive={location.pathname === '/administration'}
      />
      
      {canManageEvents && (
        <NavLink 
          to="/event-management"
          icon={<CalendarIcon className="h-4 w-4" />}
          label="Gerenciar Evento"
          isActive={location.pathname === '/event-management'}
        />
      )}
    </>
  );
}
