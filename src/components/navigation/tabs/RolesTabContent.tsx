
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
        <NavLink to="/organizer-dashboard" icon={Settings} label="Organizador" />
      )}
      
      {isDelegationRep && !isJudge && (
        <NavLink to="/delegation-dashboard" icon={Users} label="Delegação" />
      )}
      
      {isJudge && (
        <NavLink to="/judge-dashboard" icon={Gavel} label="Juiz" />
      )}
    </>
  );
}
