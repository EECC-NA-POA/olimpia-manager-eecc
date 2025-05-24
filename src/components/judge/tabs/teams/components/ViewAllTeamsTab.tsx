
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { TeamFilters } from './TeamFilters';
import { AllTeamsView } from './AllTeamsView';
import { ModalityOption, TeamData } from '../types';

interface ViewAllTeamsTabProps {
  allTeams: TeamData[];
  allModalities: ModalityOption[];
  branches: { id: string; nome: string }[];
  isLoadingAllTeams: boolean;
  allTeamsError: any;
  modalityFilter: number | null;
  branchFilter: string | null;
  searchTerm: string;
  setModalityFilter: (id: number | null) => void;
  setBranchFilter: (id: string | null) => void;
  setSearchTerm: (term: string) => void;
  isOrganizer: boolean;
  eventId: string | null;
  isReadOnly?: boolean;
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
  isReadOnly = false
}: ViewAllTeamsTabProps) {
  if (isLoadingAllTeams) {
    return (
      <div className="space-y-4 mt-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (allTeamsError) {
    return (
      <Alert variant="destructive" className="mt-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar equipes: {allTeamsError.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 mt-6">
      <TeamFilters
        modalities={allModalities}
        branches={branches}
        modalityFilter={modalityFilter}
        branchFilter={branchFilter}
        searchTerm={searchTerm}
        onModalityFilterChange={setModalityFilter}
        onBranchFilterChange={setBranchFilter}
        onSearchTermChange={setSearchTerm}
        isOrganizer={isOrganizer}
      />
      
      <AllTeamsView 
        teams={allTeams}
        isOrganizer={isOrganizer}
        eventId={eventId}
        isReadOnly={isReadOnly}
      />
    </div>
  );
}
