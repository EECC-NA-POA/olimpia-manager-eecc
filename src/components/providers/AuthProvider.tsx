
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase, handleSupabaseError, recoverSession } from '@/lib/supabase';
import { AuthContextType, AuthUser } from '@/types/auth';
import { PUBLIC_ROUTES, PublicRoute } from '@/constants/routes';
import { fetchUserProfile, handleAuthRedirect, clearUserProfileCache } from '@/services/authService';
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
  const { signIn, signOut, signUp, resendVerificationEmail } = useAuthOperations();

  // Update localStorage and reload user profile when currentEventId changes
  useEffect(() => {
    if (currentEventId) {
      localStorage.setItem('currentEventId', currentEventId);
    } else {
      localStorage.removeItem('currentEventId');
    }
    clearUserProfileCache();
    
    // Reload user profile with new event roles when event changes
    // Only reload if we have both user.id and currentEventId
    const userId = user?.id;
    if (userId && currentEventId) {
      console.log('🔄 Event changed, reloading user profile with new roles...');
      fetchUserProfile(userId)
        .then((profile) => {
          console.log('✅ Profile reloaded with roles:', profile.papeis);
          setUser((prevUser) => prevUser ? { ...prevUser, ...profile } : prevUser);
        })
        .catch((err) => {
          console.error('❌ Error reloading profile after event change:', err);
          // Don't call handleSessionError here - event switching errors shouldn't cause logout
          // Just log the error and keep the user logged in with their existing profile
          toast.error('Erro ao carregar perfil do evento. Tente novamente.');
        });
    }
  }, [currentEventId, user?.id]);

  // Watch for changes to currentEventId in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const storedEventId = localStorage.getItem('currentEventId');
      if (storedEventId !== currentEventId) {
        console.log('📦 Event ID changed in localStorage:', storedEventId);
        setCurrentEventId(storedEventId);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    const intervalId = setInterval(() => {
      const storedEventId = localStorage.getItem('currentEventId');
      if (storedEventId !== currentEventId) {
        setCurrentEventId(storedEventId);
      }
    }, 5000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, [currentEventId]);

  // Improved session error handling - don't logout immediately
  const handleSessionError = async (error: any) => {
    console.error('🚨 Session error detected:', error);
    
    const isSessionError = error.message?.includes('JWT') || 
                          error.message?.includes('refresh_token_not_found') || 
                          error.message?.includes('token') ||
                          error.message?.includes('CompactDecodeError') ||
                          error.message?.includes('invalid session') ||
                          error.message?.includes('invalid_grant');

    if (isSessionError && !sessionExpired) {
      console.log('🔄 Attempting session recovery before logout...');
      
      // Try to recover session first
      const recoveredSession = await recoverSession();
      
      if (recoveredSession) {
        console.log('✅ Session recovered, continuing...');
        return false; // Don't logout
      }
      
      // Only logout if recovery failed
      console.log('❌ Session recovery failed, logging out...');
      setSessionExpired(true);
      setUser(null);
      localStorage.removeItem('currentEventId');
      setCurrentEventId(null);
      clearUserProfileCache();
      
      toast.error(
        'Sua sessão expirou. Por favor, faça login novamente.',
        { duration: 5000 }
      );
      
      navigate('/login', { replace: true });
      return true; // Logout occurred
    }
    
    return false; // No logout needed
  };

  useEffect(() => {
    console.log('🚀 Initializing auth state listener...');
    console.log('📍 Current location:', location.pathname);
    let mounted = true;

    // 1) Set up auth listener FIRST (sync-only to avoid deadlocks)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth state changed:', event);
      if (!mounted) return;

      if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out, clearing state');
        setUser(null);
        setSessionExpired(false);
        localStorage.removeItem('currentEventId');
        setCurrentEventId(null);
        clearUserProfileCache();
        navigate('/', { replace: true });
        return;
      }

      const baseUser = session?.user ?? null;
      setUser(baseUser as any);

      if (baseUser) {
        // Defer profile fetch to avoid blocking the auth callback
          setTimeout(async () => {
            try {
              const userProfile = await fetchUserProfile(baseUser.id);
              if (mounted) {
                setUser({ ...(baseUser as any), ...userProfile });
                setSessionExpired(false);
              }
            } catch (err) {
              console.error('❌ Error loading profile after auth change:', err);
              // Only handle session errors, not profile loading errors
              const error = err as any;
              const isRealSessionError = error.message?.includes('JWT') || 
                                        error.message?.includes('refresh_token_not_found') || 
                                        error.message?.includes('invalid session');
              if (isRealSessionError) {
                await handleSessionError(err);
              } else {
                console.log('Profile loading error, but keeping user logged in');
                toast.error('Erro ao carregar perfil. Algumas funcionalidades podem estar limitadas.');
              }
            }
          }, 0);
      }
    });

    // 2) THEN check for existing session
    (async () => {
      try {
        console.log('🔍 Getting current session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
          const logoutOccurred = await handleSessionError(error);
          if (logoutOccurred) return;
        }
        
        console.log('📊 Session status:', { hasSession: !!session });

        if (!session?.user) {
          if (!PUBLIC_ROUTES.includes(location.pathname as PublicRoute) && location.pathname !== '/reset-password') {
            console.log('❌ No session and not on public route, redirecting to /');
            navigate('/', { replace: true });
          }
        } else {
          const storedEventId = localStorage.getItem('currentEventId');
          if (storedEventId && storedEventId !== currentEventId) {
            setCurrentEventId(storedEventId);
          }

          // Defer profile fetch on init as well
          setTimeout(async () => {
            try {
              const userProfile = await fetchUserProfile(session.user.id);
              if (mounted) {
                setUser({ ...session.user, ...userProfile });
                setSessionExpired(false);
              }
            } catch (profileError) {
              console.error('❌ Error fetching user profile:', profileError);
              // Only handle real session errors, not profile loading errors
              const error = profileError as any;
              const isRealSessionError = error.message?.includes('JWT') || 
                                        error.message?.includes('refresh_token_not_found') || 
                                        error.message?.includes('invalid session');
              if (isRealSessionError) {
                await handleSessionError(profileError);
              } else {
                console.log('Profile loading error on init, but keeping user logged in');
                if (mounted) {
                  setUser(session.user as any);
                }
              }
            }
          }, 0);
        }
      } catch (error) {
        console.error('❌ Error in auth setup:', error);
        await handleSessionError(error);
      } finally {
        if (mounted) {
          console.log('✅ Auth setup complete');
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname, currentEventId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LoadingImage text="Carregando autenticação..." />
      </div>
    );
  }
  
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
