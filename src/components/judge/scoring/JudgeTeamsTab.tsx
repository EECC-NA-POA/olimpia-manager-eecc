
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAllTeamsData } from '../tabs/teams/hooks/useAllTeamsData';
import { JudgeTeamsTabHeader } from './JudgeTeamsTabHeader';
import { JudgeViewAllTeamsTab } from './JudgeViewAllTeamsTab';
import { NoModalitiesMessage } from '../tabs/teams/components/NoModalitiesMessage';
import { LoadingTeamsState } from '../tabs/teams/components/LoadingTeamsState';

interface JudgeTeamsTabProps {
  userId: string;
  eventId: string | null;
}

export function JudgeTeamsTab({ userId, eventId }: JudgeTeamsTabProps) {
  const { user } = useAuth();
  
  // States for filtering
  const [modalityFilter, setModalityFilter] = useState<number | null>(null);
  const [branchFilter, setBranchFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Data for viewing all teams - judges see all teams regardless of branch
  const {
    teams: allTeams,
    modalities: allModalities,
    branches,
    isLoading: isLoadingAllTeams,
    error: allTeamsError
  } = useAllTeamsData(eventId, modalityFilter, branchFilter, searchTerm, undefined);

  if (isLoadingAllTeams) {
    return <LoadingTeamsState />;
  }

  if (!allModalities || allModalities.length === 0) {
    return <NoModalitiesMessage />;
  }

  // Transform teams data to match expected interface
  const transformedTeams = allTeams?.map(team => {
    return {
      equipe_id: team.id,
      equipe_nome: team.nome,
      modalidade_id: team.modalidade_id,
      modalidade_nome: team.modalidade_info?.nome || '',
      tipo_pontuacao: 'pontos',
      filial_nome: team.filial_id || '',
      members: team.atletas?.map(athlete => ({
        atleta_id: athlete.atleta_id,
        atleta_nome: athlete.atleta_nome || '',
        numero_identificador: athlete.numero_identificador || ''
      })) || []
    };
  }) || [];

  // Transform modalities data to match expected interface
  const transformedModalities = allModalities?.map(modality => ({
    modalidade_id: modality.id,
    modalidade_nome: modality.nome
  })) || [];

  return (
    <div className="space-y-6">
      <JudgeTeamsTabHeader>
        <JudgeViewAllTeamsTab
          allTeams={transformedTeams}
          allModalities={transformedModalities}
          branches={branches}
          isLoadingAllTeams={isLoadingAllTeams}
          allTeamsError={allTeamsError}
          modalityFilter={modalityFilter}
          branchFilter={branchFilter}
          searchTerm={searchTerm}
          setModalityFilter={setModalityFilter}
          setBranchFilter={setBranchFilter}
          setSearchTerm={setSearchTerm}
          eventId={eventId}
          judgeId={userId}
        />
      </JudgeTeamsTabHeader>
    </div>
  );
}
