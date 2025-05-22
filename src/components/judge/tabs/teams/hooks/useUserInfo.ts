
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserInfo } from '../types';

export function useUserInfo(userId: string, eventId: string | null) {
  // Fetch user branch info if not an organizer
  const { data: userInfo } = useQuery({
    queryKey: ['user-info', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, filial_id')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user info:', error);
        return null;
      }
      
      return data as UserInfo;
    },
    enabled: !!userId,
  });

  return { userInfo };
}
