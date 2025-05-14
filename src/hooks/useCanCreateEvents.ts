
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

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
          setCanCreateEvents(data?.cadastra_eventos || false);
        }
      } catch (error) {
        console.error('Error in useCanCreateEvents hook:', error);
        setCanCreateEvents(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkPermission();
  }, [user]);

  return { canCreateEvents, isLoading };
}
