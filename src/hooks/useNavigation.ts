
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

  useEffect(() => {
    // Only run if we're at the home page (not the root index page)
    if (user && location.pathname === '/home') {
      console.log('Navigation - Redirecting based on roles from /home path');
      console.log('Current event ID:', currentEventId);
      
      // First check if there's a selected event
      if (!currentEventId) {
        console.log('No event selected, redirecting to event selection page');
        navigate('/event-selection', { replace: true });
        return;
      }
      
      // If there's a selected event, redirect based on roles
      if (roles.isAthlete || roles.isPublicGeral) {
        navigate('/athlete-profile', { replace: true });
      } else if (roles.isOrganizer) {
        navigate('/organizer-dashboard', { replace: true });
      } else if (roles.isDelegationRep) {
        navigate('/delegation-dashboard', { replace: true });
      } else if (roles.isAdmin) {
        navigate('/administration', { replace: true });
      } else if (roles.isJudge) {
        navigate('/judge-dashboard', { replace: true });
      }
    }
  }, [roles, location.pathname, navigate, user, currentEventId]);

  return {
    user,
    roles,
    signOut
  };
};
