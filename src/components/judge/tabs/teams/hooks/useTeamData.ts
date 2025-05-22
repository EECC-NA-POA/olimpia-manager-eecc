
import { useState } from 'react';
import { useUserInfo } from './useUserInfo';
import { useModalities } from './useModalities';
import { useTeams } from './useTeams';
import { useAvailableAthletes } from './useAvailableAthletes';

export function useTeamData(userId: string, eventId: string | null, isOrganizer = false) {
  const [selectedModalityId, setSelectedModalityId] = useState<number | null>(null);

  // Get user info and branch info
  const { userInfo } = useUserInfo(userId, isOrganizer);

  // Get modalities for the event (collective ones)
  const { modalities, isLoadingModalities } = useModalities(eventId);

  // Get teams for the selected modality
  const { existingTeams, isLoadingTeams } = useTeams(
    eventId, 
    selectedModalityId, 
    isOrganizer, 
    userInfo?.filial_id
  );

  // Get available athletes for the selected modality
  const { availableAthletes } = useAvailableAthletes(
    eventId,
    selectedModalityId,
    isOrganizer,
    userInfo?.filial_id,
    existingTeams || []
  );

  return {
    userInfo,
    modalities,
    isLoadingModalities,
    selectedModalityId,
    setSelectedModalityId,
    existingTeams,
    isLoadingTeams,
    availableAthletes
  };
}
