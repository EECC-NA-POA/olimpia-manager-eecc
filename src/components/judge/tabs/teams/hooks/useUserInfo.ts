
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useUserInfo(userId: string, eventId: string | null) {
  const { data: userInfo, isLoading, error } = useQuery({
    queryKey: ['user-info', userId],
    queryFn: async () => {
      console.log('Fetching user info for userId:', userId);
      
      if (!userId) {
        return null;
      }

      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('filial_id, nome_completo')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('Error fetching user info:', error);
          return null;
        }

        console.log('User info fetched:', data);
        return data;
      } catch (error) {
        console.error('Error in user info query:', error);
        return null;
      }
    },
    enabled: !!userId,
  });

  return { userInfo, isLoading, error };
}
