
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useMemo } from 'react';

interface UserRoles {
  isOrganizer: boolean;
  isAthlete: boolean;
  isDelegationRep: boolean;
  isPublicGeral: boolean;
  isAdmin: boolean;
  isJudge: boolean;
  isFilosofoMonitor: boolean;
}

export const useNavigation = () => {
  const { user, signOut, currentEventId, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Get all roles codes from the user's roles
  const userRoleCodes = user?.papeis?.map(role => role.codigo) || [];
  console.log('User role codes:', userRoleCodes);
  console.log('User papeis:', user?.papeis);

  // Check for each role type - memoized to prevent unnecessary recalculations
  const roles: UserRoles = useMemo(() => ({
    isOrganizer: userRoleCodes.includes('ORG') || userRoleCodes.includes('ORE'), // Support both codes
    isAthlete: userRoleCodes.includes('ATL'),
    isDelegationRep: userRoleCodes.includes('RDD'),
    isPublicGeral: userRoleCodes.includes('PGR'),
    isAdmin: userRoleCodes.includes('ADM'),
    isJudge: userRoleCodes.includes('JUZ'),
    isFilosofoMonitor: userRoleCodes.includes('FMON') || userRoleCodes.includes('FMO') || userRoleCodes.includes('FILOSOFO_MONITOR') || userRoleCodes.includes('filosofo_monitor')
  }), [userRoleCodes.join(',')]);

  console.log('Detected roles:', roles);
  console.log('Is Filosofo Monitor?', roles.isFilosofoMonitor);
  console.log('Checking for FMON code:', userRoleCodes.includes('FMON'));

  // Redirect authenticated users without an event to event selection
  // Skip if a logout flow is in progress (set via sessionStorage)
  useEffect(() => {
    const loggingOut = typeof window !== 'undefined' && sessionStorage.getItem('logoutPending') === '1';
    if (!loading && user && !currentEventId && !loggingOut &&
        location.pathname !== '/event-selection' && 
        !location.pathname.startsWith('/event') &&
        location.pathname !== '/verificar-email' &&
        location.pathname !== '/reset-password' &&
        location.pathname !== '/' &&
        location.pathname !== '/login' &&
        location.pathname !== '/signup') {
      console.log('User logged in but no event selected, redirecting to event selection');
      navigate('/event-selection', { replace: true });
    }
  }, [loading, user, currentEventId, location.pathname, navigate]);

  return {
    user,
    roles,
    signOut
  };
};
