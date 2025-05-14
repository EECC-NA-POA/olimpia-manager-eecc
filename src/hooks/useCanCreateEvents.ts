
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
          // This handles true (boolean), 'true' (string), or 'TRUE' (uppercase string)
          // Explicitly compare without using type conversion
          const hasPermission = data?.cadastra_eventos === true || 
                               data?.cadastra_eventos === 'true' || 
                               data?.cadastra_eventos === 'TRUE';
          
          console.log('Raw permission value:', data?.cadastra_eventos);
          console.log('Data type of permission:', typeof data?.cadastra_eventos);
          console.log('Calculated permission value:', hasPermission);
          
          setCanCreateEvents(hasPermission);
        }
      } catch (error) {
        console.error('Error in useCanCreateEvents hook:', error);
        toast.error('Erro ao verificar permissões');
        setCanCreateEvents(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkPermission();
  }, [user]);

  return { canCreateEvents, isLoading };
}
