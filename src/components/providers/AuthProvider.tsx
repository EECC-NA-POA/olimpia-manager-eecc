
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { AuthContextType, AuthUser } from '@/types/auth';
import { PUBLIC_ROUTES, PublicRoute } from '@/constants/routes';
import { fetchUserProfile, handleAuthRedirect } from '@/services/authService';
import { AuthContext } from '@/contexts/AuthContext';
import { useAuthOperations } from '@/hooks/useAuthOperations';
import { LoadingImage } from '@/components/ui/loading-image';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [currentEventId, setCurrentEventId] = useState<string | null>(() => {
    return localStorage.getItem('currentEventId');
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signOut, signUp, resendVerificationEmail } = useAuthOperations({ setUser, navigate, location });

  // Update localStorage when currentEventId changes
  useEffect(() => {
    if (currentEventId) {
      localStorage.setItem('currentEventId', currentEventId);
    } else {
      localStorage.removeItem('currentEventId');
    }
  }, [currentEventId]);

  // Watch for changes to currentEventId in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const storedEventId = localStorage.getItem('currentEventId');
      console.log('Storage event detected, event ID:', storedEventId);
      if (storedEventId !== currentEventId) {
        setCurrentEventId(storedEventId);
      }
    };

    // Add event listener for storage events
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically
    const intervalId = setInterval(() => {
      const storedEventId = localStorage.getItem('currentEventId');
      if (storedEventId !== currentEventId) {
        console.log('Event ID changed in localStorage:', storedEventId);
        setCurrentEventId(storedEventId);
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, [currentEventId]);

  useEffect(() => {
    console.log('Current Event ID in AuthContext:', currentEventId);
  }, [currentEventId]);

  // Função para lidar com erros de sessão
  const handleSessionError = (error: any) => {
    console.error('Session error detected:', error);
    
    // Verifica se é um erro relacionado à sessão/token
    const isSessionError = error.message?.includes('JWT') || 
                          error.message?.includes('refresh_token_not_found') || 
                          error.message?.includes('token') ||
                          error.message?.includes('CompactDecodeError') ||
                          error.message?.includes('invalid session') ||
                          error.message?.includes('invalid_grant');

    if (isSessionError && !sessionExpired) {
      setSessionExpired(true);
      setUser(null);
      localStorage.removeItem('currentEventId');
      setCurrentEventId(null);
      
      toast.error(
        'Sua sessão expirou. Por favor, faça login novamente.',
        { duration: 5000 }
      );
      
      navigate('/login', { replace: true });
    }
  };

  useEffect(() => {
    console.log('Setting up authentication state...');
    console.log('Current location:', location.pathname);
    console.log('Public routes:', PUBLIC_ROUTES);
    let mounted = true;

    const setupAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          handleSessionError(error);
          return;
        }
        
        console.log('Session status:', session ? 'Active' : 'No active session');

        if (!session?.user && !PUBLIC_ROUTES.includes(location.pathname as PublicRoute) && 
            location.pathname !== '/reset-password') {
          console.log('No active session and not on a public route, redirecting to /')
          navigate('/', { replace: true });
          return;
        }

        if (session?.user) {
          console.log('User session found, fetching profile for user ID:', session.user.id);
          const storedEventId = localStorage.getItem('currentEventId');
          if (storedEventId && storedEventId !== currentEventId) {
            setCurrentEventId(storedEventId);
          }
          
          try {
            const userProfile = await fetchUserProfile(session.user.id);
            if (mounted) {
              console.log('Setting user with profile data:', userProfile);
              setUser({ ...session.user, ...userProfile });
              setSessionExpired(false); // Reset session expired flag
            }
          } catch (profileError) {
            console.error('Error fetching user profile:', profileError);
            handleSessionError(profileError);
            return;
          }
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event);

            if (event === 'SIGNED_OUT') {
              if (mounted) {
                console.log('User signed out, clearing state');
                setUser(null);
                setSessionExpired(false);
                localStorage.removeItem('currentEventId');
                setCurrentEventId(null);
                navigate('/', { replace: true });
              }
              return;
            }

            if (event === 'TOKEN_REFRESHED') {
              console.log('Token refreshed successfully');
              setSessionExpired(false);
            }

            if (session?.user) {
              try {
                console.log('User session updated, fetching profile');
                const userProfile = await fetchUserProfile(session.user.id);
                if (mounted) {
                  console.log('Setting updated user with profile data');
                  setUser({ ...session.user, ...userProfile });
                  setSessionExpired(false);
                }
              } catch (error) {
                console.error('Error in auth setup:', error);
                handleSessionError(error);
              }
            } else {
              if (mounted) {
                console.log('No user session after auth state change');
                setUser(null);
                if (!PUBLIC_ROUTES.includes(location.pathname as PublicRoute)) {
                  console.log('Not on a public route, redirecting to /');
                  navigate('/', { replace: true });
                }
              }
            }
          }
        );

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error in auth setup:', error);
        handleSessionError(error);
      } finally {
        if (mounted) {
          console.log('Auth setup complete, setting loading to false');
          setLoading(false);
        }
      }
    };

    setupAuth();
    return () => {
      mounted = false;
    };
  }, [navigate, location.pathname]);

  if (loading) {
    console.log('Auth is still loading, showing loading state');
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LoadingImage text="Carregando..." />
      </div>
    );
  }

  console.log('Auth provider rendering with user:', user ? 'Logged in' : 'Not logged in');
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn, 
      signOut, 
      signUp,
      resendVerificationEmail,
      currentEventId,
      setCurrentEventId
    }}>
      {children}
    </AuthContext.Provider>
  );
}
