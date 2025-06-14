
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

  // Redirect authenticated users without an event to event selection
  useEffect(() => {
    if (user && !currentEventId && 
        location.pathname !== '/event-selection' && 
        !location.pathname.startsWith('/event') &&
        location.pathname !== '/verificar-email' &&
        location.pathname !== '/reset-password') {
      console.log('User logged in but no event selected, redirecting to event selection');
      navigate('/event-selection', { replace: true });
    }
  }, [user, currentEventId, location.pathname, navigate]);

  return {
    user,
    roles,
    signOut
  };
};
