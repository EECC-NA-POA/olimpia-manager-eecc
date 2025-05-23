
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserInfo } from '../types';

export function useUserInfo(userId: string, eventId: string | null) {
  // Fetch user branch info if not an organizer
  const { data: userInfo, isLoading, error } = useQuery({
    queryKey: ['user-info', userId],
    queryFn: async () => {
      console.log('useUserInfo - Starting fetch for userId:', userId);
      
      if (!userId) {
        console.log('useUserInfo - No userId provided');
        return null;
      }
      
      try {
        // First check if we have a valid session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('useUserInfo - Session error:', sessionError);
          throw new Error('Sessão inválida. Por favor, faça login novamente.');
        }
        
        if (!sessionData.session) {
          console.log('useUserInfo - No active session');
          throw new Error('Sessão não encontrada. Por favor, faça login novamente.');
        }
        
        console.log('useUserInfo - Valid session found, querying usuarios table for user:', userId);
        
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
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      const errorMessage = error?.message || '';
      if (errorMessage.includes('Sessão') || errorMessage.includes('JWT') || errorMessage.includes('CompactDecodeError')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  console.log('useUserInfo - Hook state:', { 
    userInfo, 
    isLoading, 
    error: error?.message,
    userId 
  });

  return { userInfo, isLoading, error };
}
