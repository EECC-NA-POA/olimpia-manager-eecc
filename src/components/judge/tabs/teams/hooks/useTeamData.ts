
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useModalities } from './useModalities';
import { useTeams } from './useTeams';
import { useUserInfo } from './useUserInfo';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useTeamData(userId: string, eventId: string | null, isOrganizer: boolean = false) {
  const { user } = useAuth();
  const [selectedModalityId, setSelectedModalityId] = useState<number | null>(null);
  
  // Get modalities
  const { modalities, isLoadingModalities } = useModalities(eventId);
  
  // Get user info (only for non-organizers)
  const { userInfo, isLoading: isLoadingUserInfo, error: userInfoError } = useUserInfo(
    isOrganizer ? '' : userId, 
    eventId
  );
  
  // Determine branch ID
  const branchId = isOrganizer ? undefined : (userInfo?.filial_id || user?.filial_id);
  
  // Get teams
  const { data: existingTeams, isLoading: isLoadingTeams } = useTeams(
    userId,
    eventId,
    selectedModalityId,
    branchId,
    isOrganizer
  );
  
  // Get available athletes
  const { data: availableAthletes, isLoading: isLoadingAthletes, error: athletesError } = useQuery({
    queryKey: ['available-athletes', eventId, branchId],
    queryFn: async () => {
      if (!eventId || isOrganizer) {
        return [];
      }

      try {
        let query = supabase
          .from('usuarios')
          .select('id, nome_completo, tipo_documento, numero_documento')
          .eq('confirmado', true);

        if (branchId) {
          query = query.eq('filial_id', branchId);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching athletes:', error);
          return [];
        }

        return data || [];
      } catch (error) {
        console.error('Error in athletes query:', error);
        return [];
      }
    },
    enabled: !!eventId && !isOrganizer
  });

  return {
    modalities,
    isLoadingModalities,
    selectedModalityId,
    setSelectedModalityId,
    existingTeams,
    isLoadingTeams,
    userInfo,
    isLoadingUserInfo,
    userInfoError,
    availableAthletes,
    isLoadingAthletes,
    athletesError
  };
}
