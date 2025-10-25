
import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase, handleSupabaseError } from '@/lib/supabase';

export const useSignOut = () => {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

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

      // Clear all react-query cache to prevent stale data
      console.log('🗑️ Clearing all query cache');
      queryClient.clear();

      console.log('✅ Signout successful');
      
    } catch (error: any) {
      console.error('Sign out error occurred');
      const errorMessage = handleSupabaseError(error);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [queryClient]);

  return { signOut, loading };
};
