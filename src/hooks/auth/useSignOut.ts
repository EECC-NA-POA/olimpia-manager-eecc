
import { useState, useCallback } from 'react';
import { supabase, handleSupabaseError } from '@/lib/supabase';

export const useSignOut = () => {
  const [loading, setLoading] = useState(false);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      console.log('🚪 Starting signout process');

      // Clear any stored event ID
      localStorage.removeItem('currentEventId');

      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.warn('⚠️ Global signout failed, trying local signout');
        const { error: localError } = await supabase.auth.signOut({ scope: 'local' });
        if (localError) {
          console.error('❌ Signout error:', localError);
          throw localError;
        }
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

  return { signOut, loading };
};
