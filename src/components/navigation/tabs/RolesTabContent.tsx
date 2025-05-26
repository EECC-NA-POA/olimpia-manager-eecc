
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Users, Gavel } from 'lucide-react';
import { NavLink } from '../NavLink';

interface RolesTabContentProps {
  isOrganizer: boolean;
  isDelegationRep: boolean;
  isJudge: boolean;
}

export function RolesTabContent({ isOrganizer, isDelegationRep, isJudge }: RolesTabContentProps) {
  const location = useLocation();
  
  return (
    <>
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
    </>
  );
}
