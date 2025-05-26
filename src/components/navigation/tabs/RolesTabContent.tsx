
import React from 'react';
import { NavLink } from '../NavLink';
import { Users, Gavel, Settings } from 'lucide-react';

interface RolesTabContentProps {
  isOrganizer: boolean;
  isDelegationRep: boolean;
  isJudge: boolean;
}

export function RolesTabContent({ isOrganizer, isDelegationRep, isJudge }: RolesTabContentProps) {
  return (
    <>
      {isOrganizer && (
        <NavLink to="/organizer-dashboard" icon={<Settings className="h-4 w-4" />} label="Organizador" />
      )}
      
      {isDelegationRep && !isJudge && (
        <NavLink to="/delegation-dashboard" icon={<Users className="h-4 w-4" />} label="Delegação" />
      )}
      
      {isJudge && (
        <NavLink to="/judge-dashboard" icon={<Gavel className="h-4 w-4" />} label="Juiz" />
      )}
    </>
  );
}
