import { useState } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { AuthUser } from '@/types/auth';
import { fetchUserProfile, handleAuthRedirect } from '@/services/authService';
import { AuthError } from '@supabase/supabase-js';

interface UseAuthOperationsProps {
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
  navigate: NavigateFunction;
  location: { pathname: string };
}

export function useAuthOperations({ setUser, navigate, location }: UseAuthOperationsProps) {
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
  
      if (error) {
        // Parse error message from Supabase
        if (error instanceof AuthError) {
          const errorMessage = error.message;
          if (errorMessage.includes('Invalid login credentials')) {
            throw new Error('Invalid login credentials');
          }
          throw new Error(errorMessage);
        }
        
        // Fallback error
        throw new Error('Login failed');
      }
  
      if (!data.user) {
        throw new Error("Login failed");
      }
  
      const profile = await fetchUserProfile(data.user.id);
      setUser({ ...data.user, ...profile });
      handleAuthRedirect(profile, location.pathname, navigate);
      toast.success("Login realizado com sucesso!");
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('useAuthOperations - Starting logout process...');
      
      // Clear user data first
      setUser(null);
      
      // Clear event data from localStorage
      localStorage.removeItem('currentEventId');
      
      // Then sign out from Supabase API
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('useAuthOperations - Error during signOut:', error);
        if (error.message?.includes('session_not_found')) {
          console.log('useAuthOperations - Session already expired, continuing with local cleanup');
        } else {
          console.warn('useAuthOperations - Non-session error during logout:', error);
        }
      }

      console.log('useAuthOperations - Logout successful, navigating to landing page');
      
      // Navigate to homepage and use replace to prevent back navigation
      navigate('/', { replace: true });
      
      return;
      
    } catch (error: any) {
      console.error('useAuthOperations - Unexpected error during signOut:', error);
      
      // Even with errors, clear local data
      setUser(null);
      localStorage.removeItem('currentEventId');
      
      // Navigate to homepage
      navigate('/', { replace: true });
      
      throw error;
    }
  };

  const signUp = async (userData: {
    email: string;
    password: string;
    options?: {
      data?: {
        nome_completo?: string;
        telefone?: string;
        filial_id?: string | null;
        tipo_documento?: string;
        numero_documento?: string;
        genero?: string;
        data_nascimento?: string;
      };
    };
  }) => {
    try {
      console.log('Starting new user registration.');
      
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            nome_completo: userData.options?.data?.nome_completo,
            telefone: userData.options?.data?.telefone,
            filial_id: userData.options?.data?.filial_id,
            tipo_documento: userData.options?.data?.tipo_documento,
            numero_documento: userData.options?.data?.numero_documento,
            genero: userData.options?.data?.genero,
            data_nascimento: userData.options?.data?.data_nascimento
          }
        }
      });
  
      if (error) {
        console.error('Auth Error:', error.message);
        toast.error('Erro ao criar conta. Tente novamente.');
        return { user: null, error };
      }
  
      if (!data.user) {
        toast.error('Erro ao criar conta. Tente novamente.');
        return { user: null, error: new Error('User creation failed') };
      }
  
      console.log('User registered successfully!');
      toast.success('Cadastro realizado com sucesso! Faça login para acessar o sistema.');
      navigate('/');
  
      return { user: data.user, error: null };
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error('Erro ao realizar cadastro.');
      return { user: null, error };
    }
  };

  const resendVerificationEmail = async (email: string) => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('id, email_confirmed_at')
        .eq('email', email)
        .single();
      
      if (userError) {
        console.error('Error checking user:', userError);
        toast.error('Erro ao verificar status do email.');
        return;
      }

      if (userData?.email_confirmed_at) {
        toast.error('Este e-mail já foi confirmado. Por favor, faça login.');
        navigate('/login');
        return;
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`,
        },
      });

      if (error) throw error;
      toast.success('Email de verificação reenviado com sucesso!');
    } catch (error: any) {
      console.error('Error resending verification email:', error);
      toast.error('Erro ao reenviar email de verificação.');
      throw error;
    }
  };

  return {
    signIn,
    signOut,
    signUp,
    resendVerificationEmail
  };
}
