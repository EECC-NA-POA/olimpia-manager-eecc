
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UserInfoData {
  filial_id: string;
  nome_completo: string;
}

export function useUserInfo(userId: string, eventId: string | null) {
  const { data: userInfo, isLoading, error } = useQuery({
    queryKey: ['user-info', userId, eventId],
    queryFn: async (): Promise<UserInfoData | null> => {
      try {
        console.log('Fetching user info for userId:', userId);
        
        if (!userId) {
          console.log('No userId provided, skipping user info fetch');
          return null;
        }

        const { data, error } = await supabase
          .from('usuarios')
          .select('filial_id, nome_completo')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('Error fetching user info:', error);
          throw error;
        }

        console.log('User info fetched:', data);
        return data as UserInfoData;
      } catch (error: any) {
        console.error('Exception in user info query:', error);
        throw error;
      }
    },
    enabled: !!userId && !!eventId,
  });

  console.log('useUserInfo - Hook state:', {
    userInfo,
    isLoading,
    error: error?.message,
    userId,
    eventId
  });

  return { userInfo, isLoading, error };
}
