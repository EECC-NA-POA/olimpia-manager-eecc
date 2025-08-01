
import { useState, useCallback } from 'react';
import { supabase, handleSupabaseError } from '@/lib/supabase';

export const useSignOut = () => {
  const [loading, setLoading] = useState(false);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      console.log('🚪 Starting signout process');

      // Clear any stored event ID first
      localStorage.removeItem('currentEventId');

      // Get current session to check if it exists
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session) {
        console.log('⚠️ No active session found, treating as successful logout');
        return; // Exit successfully - user is already logged out
      }

      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Signout error:', error);
        
        // If session not found, consider it as successful logout
        if (error.message?.includes('session_not_found') || 
            error.message?.includes('Session from session_id claim in JWT does not exist') ||
            error.message?.includes('Auth session missing')) {
          console.log('⚠️ Session already invalid, treating as successful logout');
          return; // Exit successfully
        }
        
        throw error;
      }

      console.log('✅ Signout successful');
      
    } catch (error: any) {
      console.error('Sign out error occurred:', error);
      
      // If session not found or missing, don't throw error - treat as successful
      if (error.message?.includes('session_not_found') || 
          error.message?.includes('Session from session_id claim in JWT does not exist') ||
          error.message?.includes('Auth session missing')) {
        console.log('⚠️ Session already invalid during catch, treating as successful logout');
        return; // Exit successfully
      }
      
      const errorMessage = handleSupabaseError(error);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return { signOut, loading };
};
