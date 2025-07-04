
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useCanCreateEvents() {
  const { user } = useAuth();
  const [canCreateEvents, setCanCreateEvents] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPermission = async () => {
      if (!user) {
        setCanCreateEvents(false);
        setIsLoading(false);
        return;
      }

      try {
        console.log('Checking create event permission for user:', user.id);
        
        const { data, error } = await supabase
          .from('usuarios')
          .select('cadastra_eventos')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error checking event creation permission:', error);
          setCanCreateEvents(false);
        } else {
          console.log('User permission data:', data);
          
          // Boolean values in Supabase can come in different formats
          // Handle both boolean and string representations
          const hasPermission = 
            data?.cadastra_eventos === true || 
            data?.cadastra_eventos === 'true' || 
            data?.cadastra_eventos === 'TRUE';
          
          console.log('Can create events:', hasPermission);
          setCanCreateEvents(hasPermission || false);
        }
      } catch (error) {
        console.error('Error in useCanCreateEvents hook:', error);
        // Don't show toast error for permission checks to avoid spam
        console.warn('Failed to verify event creation permissions');
        setCanCreateEvents(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkPermission();
  }, [user]);

  return { canCreateEvents, isLoading };
}
