
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase, handleSupabaseError, recoverSession } from '@/lib/supabase';
import i18n from '@/i18n';
import { updateLastActivity, setFirstLoginIfNeeded, clearSessionTimestamps, isSessionExpiredByInactivity } from '@/lib/storageAdapter';
import { AuthContextType, AuthUser } from '@/types/auth';
import { PUBLIC_ROUTES, PublicRoute } from '@/constants/routes';
import { fetchUserProfile, handleAuthRedirect, clearUserProfileCache } from '@/services/authService';
import { AuthContext } from '@/contexts/AuthContext';
import { useAuthOperations } from '@/hooks/useAuthOperations';
import { LoadingImage } from '@/components/ui/loading-image';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileEventId, setProfileEventId] = useState<string | null>(null);
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
          setProfileEventId(currentEventId);
        })
        .catch((err) => {
          console.error('❌ Error reloading profile after event change:', err);
          toast.error(i18n.t('errors.eventProfileError'));
          setProfileEventId(currentEventId); // unblock even on error
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
        i18n.t('errors.sessionExpired'),
        { duration: 5000 }
      );

      navigate('/login', { replace: true });
      return true; // Logout occurred
    }

    return false; // No logout needed
  };

  // Captura o pathname no momento da montagem — não deve ficar nas dependências
  // para evitar que o efeito de auth reinicialize a cada navegação.
  const initialPathnameRef = useRef(location.pathname);

  useEffect(() => {
    // Pathname capturado uma vez na montagem (não re-executa a cada rota)
    const initialPathname = initialPathnameRef.current;
    console.log('🚀 Initializing auth state listener...');
    console.log('📍 Current location:', initialPathname);
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
        clearSessionTimestamps();
        navigate('/', { replace: true });
        return;
      }

      const baseUser = session?.user ?? null;
      setUser(baseUser as any);

      if (baseUser) {
        // Defer profile fetch to avoid blocking the auth callback
        setTimeout(async () => {
          const eventId = localStorage.getItem('currentEventId');
          try {
            const userProfile = await fetchUserProfile(baseUser.id);
            if (mounted) {
              setUser({ ...(baseUser as any), ...userProfile });
              setSessionExpired(false);
              setProfileEventId(eventId);
              updateLastActivity();
              setFirstLoginIfNeeded();
            }
          } catch (err) {
            console.error('❌ Error loading profile after auth change:', err);
            const error = err as any;
            const isRealSessionError = error.message?.includes('JWT') ||
              error.message?.includes('refresh_token_not_found') ||
              error.message?.includes('invalid session');
            if (isRealSessionError) {
              await handleSessionError(err);
            } else {
              console.log('Profile loading error, but keeping user logged in');
              toast.error(i18n.t('errors.profileLoadError'));
            }
            if (mounted) setProfileEventId(eventId);
          }
        }, 0);
      }
    });

    // 2) THEN check for existing session
    (async () => {
      try {
        console.log('🔍 Getting current session...');

        // Timeout de 8s: se o servidor não responder, não travamos a tela de loading.
        // Isso protege contra servidor inacessível (timeout TCP pode levar 30-90s sem isso).
        const getSessionSafe = (): Promise<{ data: { session: any }; error: any }> =>
          Promise.race([
            supabase.auth.getSession(),
            new Promise<{ data: { session: null }; error: Error }>((resolve) =>
              setTimeout(() => {
                console.warn('⚠️ getSession() timeout — servidor não respondeu em 8s, prosseguindo sem sessão');
                resolve({ data: { session: null }, error: null });
              }, 8_000)
            ),
          ]);

        const { data: { session }, error } = await getSessionSafe();

        if (error) {
          console.error('❌ Error getting session:', error);
          const logoutOccurred = await handleSessionError(error);
          if (logoutOccurred) return;
        }

        console.log('📊 Session status:', { hasSession: !!session });

        if (!session?.user) {
          if (!PUBLIC_ROUTES.includes(initialPathname as PublicRoute) && initialPathname !== '/reset-password') {
            console.log('❌ No session and not on public route, redirecting to /');
            navigate('/', { replace: true });
          }
        } else {
          // Check for session inactivity/age expiration
          const expired = await isSessionExpiredByInactivity();
          if (expired) {
            console.log('⏰ Session expired by inactivity/age, logging out...');
            setUser(null);
            setSessionExpired(true);
            localStorage.removeItem('currentEventId');
            setCurrentEventId(null);
            clearUserProfileCache();
            await clearSessionTimestamps();
            await supabase.auth.signOut();
            toast.error(i18n.t('errors.sessionExpired'), { duration: 5000 });
            navigate('/', { replace: true });
            return;
          }

          const storedEventId = localStorage.getItem('currentEventId');
          if (storedEventId) {
            setCurrentEventId(storedEventId);
          }

          // Set base user immediately so protected routes don't kick to /login
          if (mounted) {
            setUser(session.user as any);
          }

          // Defer profile fetch on init as well
          setTimeout(async () => {
            const eventId = localStorage.getItem('currentEventId');
            try {
              const userProfile = await fetchUserProfile(session.user.id);
              if (mounted) {
                setUser({ ...session.user, ...userProfile });
                setSessionExpired(false);
                setProfileEventId(eventId);
                updateLastActivity();
                setFirstLoginIfNeeded();
              }
            } catch (profileError) {
              console.error('❌ Error fetching user profile:', profileError);
              const error = profileError as any;
              const isRealSessionError = error.message?.includes('JWT') ||
                error.message?.includes('refresh_token_not_found') ||
                error.message?.includes('invalid session');
              if (isRealSessionError) {
                await handleSessionError(profileError);
              } else {
                console.log('Profile loading error on init, but keeping user logged in');
                if (mounted) setUser(session.user as any);
              }
              if (mounted) setProfileEventId(eventId);
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
  // Dependências: apenas navigate (estável). Remover location.pathname e currentEventId
  // previne que o efeito de auth re-inicialize a cada navegação — o que causava
  // mounted=false antes de setLoading(false), deixando o app travado na tela de loading.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LoadingImage text={i18n.t('errors.loadingAuth')} />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isProfileLoading: !!currentEventId && profileEventId !== currentEventId,
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
