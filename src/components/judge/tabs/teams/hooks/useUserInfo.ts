
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserInfo } from '../types';

export function useUserInfo(userId: string, eventId: string | null) {
  // Fetch user branch info if not an organizer
  const { data: userInfo } = useQuery({
    queryKey: ['user-info', userId],
    queryFn: async () => {
      console.log('useUserInfo - Starting fetch for userId:', userId);
      
      if (!userId) {
        console.log('useUserInfo - No userId provided');
        return null;
      }
      
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('id, filial_id')
          .eq('id', userId)
          .single();
        
        if (error) {
          console.error('useUserInfo - Error fetching user info:', error);
          throw error;
        }
        
        console.log('useUserInfo - User info fetched successfully:', data);
        
        if (!data) {
          console.log('useUserInfo - No user data found');
          return null;
        }
        
        const userInfo = {
          id: data.id,
          filial_id: data.filial_id
        } as UserInfo;
        
        console.log('useUserInfo - Returning processed userInfo:', userInfo);
        return userInfo;
        
      } catch (error) {
        console.error('useUserInfo - Exception in query:', error);
        return null;
      }
    },
    enabled: !!userId,
    retry: 3,
    retryDelay: 1000,
  });

  console.log('useUserInfo - Hook returning userInfo:', userInfo);
  return { userInfo };
}
