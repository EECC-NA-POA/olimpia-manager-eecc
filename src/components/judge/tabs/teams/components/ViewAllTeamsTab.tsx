
import React from 'react';
import { TeamFilters } from './TeamFilters';
import { AllTeamsView } from './AllTeamsView';
import { LoadingTeamsState } from './LoadingTeamsState';
import { ErrorState } from '../../../../dashboard/components/ErrorState';
import { TransformedTeam, TransformedModality, Branch } from '../types';

interface ViewAllTeamsTabProps {
  allTeams: TransformedTeam[];
  allModalities: TransformedModality[];
  branches: Branch[];
  isLoadingAllTeams: boolean;
  allTeamsError: any;
  modalityFilter: number | null;
  branchFilter: string | null;
  searchTerm: string;
  setModalityFilter: (filter: number | null) => void;
  setBranchFilter: (filter: string | null) => void;
  setSearchTerm: (term: string) => void;
  isOrganizer: boolean;
  eventId: string | null;
  isReadOnly?: boolean;
  judgeId?: string;
}

export function ViewAllTeamsTab({
  allTeams,
  allModalities,
  branches,
  isLoadingAllTeams,
  allTeamsError,
  modalityFilter,
  branchFilter,
  searchTerm,
  setModalityFilter,
  setBranchFilter,
  setSearchTerm,
  isOrganizer,
  eventId,
  isReadOnly = false,
  judgeId
}: ViewAllTeamsTabProps) {
  if (isLoadingAllTeams) {
    return <LoadingTeamsState />;
  }

  if (allTeamsError) {
    return <ErrorState onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="space-y-6">
      <TeamFilters
        modalities={allModalities}
        branches={branches}
        modalityFilter={modalityFilter}
        branchFilter={branchFilter}
        searchTerm={searchTerm}
        setModalityFilter={setModalityFilter}
        setBranchFilter={setBranchFilter}
        setSearchTerm={setSearchTerm}
        showBranchFilter={isOrganizer}
      />
      
      <AllTeamsView
        teams={allTeams}
        isOrganizer={isOrganizer}
        eventId={eventId}
        isReadOnly={isReadOnly}
        judgeId={judgeId}
      />
    </div>
  );
}
