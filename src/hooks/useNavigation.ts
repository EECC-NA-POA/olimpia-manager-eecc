
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

interface UserRoles {
  isOrganizer: boolean;
  isAthlete: boolean;
  isDelegationRep: boolean;
  isPublicGeral: boolean;
  isAdmin: boolean;
  isJudge: boolean;
}

export const useNavigation = () => {
  const { user, signOut, currentEventId } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Get all roles codes from the user's roles
  const userRoleCodes = user?.papeis?.map(role => role.codigo) || [];
  console.log('User role codes:', userRoleCodes);

  // Check for each role type
  const roles: UserRoles = {
    isOrganizer: userRoleCodes.includes('ORE'),
    isAthlete: userRoleCodes.includes('ATL'),
    isDelegationRep: userRoleCodes.includes('RDD'),
    isPublicGeral: userRoleCodes.includes('PGR'),
    isAdmin: userRoleCodes.includes('ADM'),
    isJudge: userRoleCodes.includes('JUZ')
  };

  // Remove automatic redirection - let users stay on event selection page
  // Users will navigate manually after selecting an event

  return {
    user,
    roles,
    signOut
  };
};
