
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

  // Update localStorage when currentEventId changes
  useEffect(() => {
    if (currentEventId) {
      localStorage.setItem('currentEventId', currentEventId);
    } else {
      localStorage.removeItem('currentEventId');
    }
    clearUserProfileCache();
  }, [currentEventId]);

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
    console.log('🚀 Setting up authentication state...');
    console.log('📍 Current location:', location.pathname);
    let mounted = true;

    const setupAuth = async () => {
      try {
        // Get session with enhanced debugging
        console.log('🔍 Getting current session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
          const logoutOccurred = await handleSessionError(error);
          if (logoutOccurred) return;
        }
        
        console.log('📊 Session status:', {
          hasSession: !!session,
          userId: session?.user?.id || 'none',
          email: session?.user?.email || 'none'
        });

        // Only redirect if no session and not on public route
        if (!session?.user && !PUBLIC_ROUTES.includes(location.pathname as PublicRoute) && 
            location.pathname !== '/reset-password') {
          console.log('❌ No session and not on public route, redirecting to /');
          navigate('/', { replace: true });
          return;
        }

        if (session?.user) {
          console.log('✅ User session found, fetching profile...');
          const storedEventId = localStorage.getItem('currentEventId');
          if (storedEventId && storedEventId !== currentEventId) {
            setCurrentEventId(storedEventId);
          }
          
          try {
            const userProfile = await fetchUserProfile(session.user.id);
            if (mounted) {
              console.log('✅ User profile loaded successfully');
              setUser({ ...session.user, ...userProfile });
              setSessionExpired(false);
            }
          } catch (profileError) {
            console.error('❌ Error fetching user profile:', profileError);
            const logoutOccurred = await handleSessionError(profileError);
            if (logoutOccurred) return;
          }
        }

        // Set up auth state change listener with improved error handling
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('🔄 Auth state changed:', event);

            if (event === 'SIGNED_OUT') {
              if (mounted) {
                console.log('👋 User signed out, clearing state');
                setUser(null);
                setSessionExpired(false);
                localStorage.removeItem('currentEventId');
                setCurrentEventId(null);
                clearUserProfileCache();
                navigate('/', { replace: true });
              }
              return;
            }

            if (session?.user) {
              try {
                console.log('🔄 User session updated, fetching profile');
                const userProfile = await fetchUserProfile(session.user.id);
                if (mounted) {
                  console.log('✅ Updated user profile loaded');
                  setUser({ ...session.user, ...userProfile });
                  setSessionExpired(false);
                }
              } catch (error) {
                console.error('❌ Error in auth state change:', error);
                await handleSessionError(error);
              }
            } else if (!session?.user) {
              if (mounted) {
                console.log('❌ No user session after auth state change');
                setUser(null);
                if (!PUBLIC_ROUTES.includes(location.pathname as PublicRoute)) {
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
        console.error('❌ Error in auth setup:', error);
        await handleSessionError(error);
      } finally {
        if (mounted) {
          console.log('✅ Auth setup complete');
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
