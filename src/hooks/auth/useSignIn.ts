
import { useState, useCallback } from 'react';
import { supabase, handleSupabaseError } from '@/lib/supabase';

export const useSignIn = () => {
  const [loading, setLoading] = useState(false);

  const signIn = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      console.log('🔐 Starting signin process');

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Signin error:', error);
        throw error;
      }

      console.log('✅ Signin successful');

    } catch (error: any) {
      console.error('Sign in error occurred');
      const errorMessage = handleSupabaseError(error);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return { signIn, loading };
};
