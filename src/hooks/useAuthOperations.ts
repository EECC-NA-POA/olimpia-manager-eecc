
import { useState, useCallback } from 'react';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { toast } from "sonner";

export const useAuthOperations = () => {
  const [loading, setLoading] = useState(false);

  const signUp = useCallback(async (email: string, password: string, userData?: any): Promise<void> => {
    try {
      setLoading(true);
      console.log('🚀 Starting signup process for:', email);
      console.log('📝 User data:', userData);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData?.data || {}
        }
      });

      if (error) {
        console.error('❌ Signup error:', error);
        throw error;
      }

      console.log('✅ Signup successful:', {
        user: data.user?.id,
        session: !!data.session,
        needsConfirmation: !data.session
      });

    } catch (error: any) {
      console.error('Sign up error occurred');
      const errorMessage = handleSupabaseError(error);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      console.log('🔐 Starting signin process for:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Signin error:', error);
        throw error;
      }

      console.log('✅ Signin successful:', {
        user: data.user?.id,
        session: !!data.session
      });

    } catch (error: any) {
      console.error('Sign in error occurred');
      const errorMessage = handleSupabaseError(error);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      console.log('🚪 Starting signout process');

      // Clear any stored event ID
      localStorage.removeItem('currentEventId');

      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Signout error:', error);
        throw error;
      }

      console.log('✅ Signout successful');
      
    } catch (error: any) {
      console.error('Sign out error occurred');
      const errorMessage = handleSupabaseError(error);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const resendVerificationEmail = useCallback(async (email: string): Promise<void> => {
    try {
      setLoading(true);
      console.log('📧 Resending verification email for:', email);

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) {
        console.error('❌ Resend verification error:', error);
        throw error;
      }

      console.log('✅ Verification email sent successfully');
      toast.success('Email de verificação reenviado com sucesso!');
      
    } catch (error: any) {
      console.error('Resend verification error occurred');
      const errorMessage = handleSupabaseError(error);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    signUp,
    signIn,
    signOut,
    resendVerificationEmail,
    loading
  };
};
