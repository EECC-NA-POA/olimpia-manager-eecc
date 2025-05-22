
import { useState } from 'react';
import { useModalities } from './useModalities';
import { useTeams } from './useTeams';
import { useUserInfo } from './useUserInfo';
import { useAvailableAthletes } from './useAvailableAthletes';

export function useTeamData(userId: string, eventId: string | null, isOrganizer = false) {
  const [selectedModalityId, setSelectedModalityId] = useState<number | null>(null);

  // Get available modalities (collective ones)
  const { 
    data: modalities,
    isLoading: isLoadingModalities
  } = useModalities(eventId);

  // Get user info (to get branch ID)
  const { data: userInfo } = useUserInfo(userId, eventId);

  // Get existing teams for the selected modality
  const {
    data: existingTeams,
    isLoading: isLoadingTeams
  } = useTeams(userId, eventId, selectedModalityId, userInfo?.filial_id, isOrganizer);
  
  // Get available athletes for the selected modality
  const { availableAthletes } = useAvailableAthletes(
    eventId, 
    selectedModalityId, 
    isOrganizer,
    userInfo?.filial_id,
    existingTeams
  );

  return {
    modalities,
    isLoadingModalities,
    selectedModalityId,
    setSelectedModalityId,
    existingTeams,
    isLoadingTeams,
    userInfo,
    availableAthletes
  };
}
