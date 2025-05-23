
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { UserInfo } from '../types';

export function useUserInfo(userId: string, eventId: string | null) {
  const { user } = useAuth();
  
  // Fetch user branch info if not an organizer
  const { data: userInfo, isLoading, error } = useQuery({
    queryKey: ['user-info', userId],
    queryFn: async () => {
      console.log('useUserInfo - Starting fetch for userId:', userId);
      console.log('useUserInfo - Auth context user:', user);
      
      if (!userId) {
        console.log('useUserInfo - No userId provided');
        return null;
      }
      
      // If we have user data from auth context, use it directly
      if (user?.filial_id) {
        console.log('useUserInfo - Using auth context data:', {
          id: user.id,
          filial_id: user.filial_id
        });
        
        return {
          id: user.id,
          filial_id: user.filial_id
        } as UserInfo;
      }
      
      try {
        console.log('useUserInfo - Querying usuarios table for user:', userId);
        
        const { data, error } = await supabase
          .from('usuarios')
          .select('id, filial_id')
          .eq('id', userId)
          .single();
        
        if (error) {
          console.error('useUserInfo - Supabase error:', error);
          throw new Error('Erro ao carregar informações do usuário');
        }
        
        console.log('useUserInfo - Raw data from usuarios table:', data);
        
        if (!data) {
          console.log('useUserInfo - No user data found in usuarios table');
          throw new Error('Usuário não encontrado');
        }
        
        const userInfo = {
          id: data.id,
          filial_id: data.filial_id
        } as UserInfo;
        
        console.log('useUserInfo - Processed userInfo:', userInfo);
        return userInfo;
        
      } catch (error) {
        console.error('useUserInfo - Exception in query:', error);
        throw error;
      }
    },
    enabled: !!userId,
    retry: 2,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  console.log('useUserInfo - Hook state:', { 
    userInfo, 
    isLoading, 
    error: error?.message,
    userId,
    authUser: user 
  });

  return { userInfo, isLoading, error };
}
