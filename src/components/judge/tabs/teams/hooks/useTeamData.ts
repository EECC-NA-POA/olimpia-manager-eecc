
import { useState } from 'react';
import { useUserInfo } from './useUserInfo';
import { useModalities } from './useModalities';
import { useTeams } from './useTeams';
import { useAvailableAthletes } from './useAvailableAthletes';
import { useTeamCreation } from './useTeamCreation';
import { Team } from '../types';

export function useTeamData(userId: string, eventId: string | null, isOrganizer = false) {
  const [selectedModalityId, setSelectedModalityId] = useState<number | null>(null);
  const [teamName, setTeamName] = useState('');

  // Get user info and branch info
  const { userInfo } = useUserInfo(userId, isOrganizer);

  // Get modalities for the event
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

  // Team creation functionality
  const { createTeamMutation, handleCreateTeam } = useTeamCreation(
    userId,
    eventId,
    selectedModalityId,
    userInfo?.filial_id,
    isOrganizer,
    teamName,
    setTeamName
  );

  return {
    userInfo,
    modalities,
    isLoadingModalities,
    selectedModalityId,
    setSelectedModalityId,
    existingTeams,
    isLoadingTeams,
    availableAthletes: availableAthletes || [],
    teamName,
    setTeamName,
    createTeamMutation,
    handleCreateTeam
  };
}
