
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { fetchUserProfile } from '@/services/authService';
import { AuthUser } from '@/types/auth';

interface UseAuthOperationsProps {
  setUser: (user: AuthUser | null) => void;
  navigate: ReturnType<typeof useNavigate>;
  location: ReturnType<typeof useLocation>;
}

export const useAuthOperations = ({ setUser, navigate, location }: UseAuthOperationsProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    console.log('Attempting login...');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log('Login error occurred');
        throw error;
      }

      if (data.user) {
        console.log('Login successful, fetching user profile...');
        const userProfile = await fetchUserProfile(data.user.id);
        setUser({ ...data.user, ...userProfile });
        console.log('User profile loaded successfully');
        
        toast.success('Login realizado com sucesso!');
        
        // Always redirect to event selection after login - user must select an event
        console.log('Redirecting to event selection - user must select an event');
        navigate('/event-selection', { replace: true });
      }
    } catch (error: any) {
      console.error('Login Error occurred');
      toast.error(handleSupabaseError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('useAuthOperations - Starting logout process...');
      
      // Clear any existing toasts first to avoid Link rendering issues
      // Note: We avoid using toast.success here to prevent Link components in toasts
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('useAuthOperations - Logout error occurred');
        throw error;
      }
      
      console.log('useAuthOperations - Logout successful, navigating to landing page');
      
      // Clear user state
      setUser(null);
      
      // Clear localStorage
      localStorage.removeItem('currentEventId');
      
      // Navigate without using toast that might contain Link components
      navigate('/', { replace: true });
      
      // Show success message after navigation to avoid Router context issues
      setTimeout(() => {
        toast.success('Logout realizado com sucesso!');
      }, 100);
      
    } catch (error: any) {
      console.error('useAuthOperations - Error during logout occurred');
      toast.error(handleSupabaseError(error));
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Store user data temporarily for profile creation after email verification
        localStorage.setItem('pendingUserData', JSON.stringify({
          ...userData,
          userId: data.user.id
        }));
        
        toast.success('Usuário criado! Verifique seu email para confirmar a conta.');
        navigate('/verificar-email', { replace: true });
      }
    } catch (error: any) {
      console.error('Sign up error occurred');
      toast.error(handleSupabaseError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerificationEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;
      
      toast.success('Email de verificação reenviado!');
    } catch (error: any) {
      console.error('Resend verification error occurred');
      toast.error(handleSupabaseError(error));
    }
  };

  return {
    signIn,
    signOut,
    signUp,
    resendVerificationEmail,
    isLoading
  };
};
