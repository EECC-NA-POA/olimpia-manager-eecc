
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { TeamFilters } from './TeamFilters';
import { AllTeamsView } from './AllTeamsView';
import { ModalityOption, TeamData } from '../types';

interface Branch {
  id: string;
  nome: string;
}

interface ViewAllTeamsTabProps {
  allTeams: TeamData[];
  allModalities: ModalityOption[];
  branches: Branch[];
  isLoadingAllTeams: boolean;
  allTeamsError: any;
  modalityFilter: number | null;
  branchFilter: string | null;
  searchTerm: string;
  setModalityFilter: (id: number | null) => void;
  setBranchFilter: (id: string | null) => void;
  setSearchTerm: (term: string) => void;
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
  setSearchTerm
}: ViewAllTeamsTabProps) {
  return (
    <div className="space-y-6 mt-6">
      <TeamFilters
        modalities={allModalities}
        branches={branches}
        selectedModalityId={modalityFilter}
        selectedBranchId={branchFilter}
        searchTerm={searchTerm}
        onModalityChange={setModalityFilter}
        onBranchChange={setBranchFilter}
        onSearchChange={setSearchTerm}
      />

      {allTeamsError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar as equipes. Tente novamente.
          </AlertDescription>
        </Alert>
      )}

      <AllTeamsView 
        teams={allTeams}
        isLoading={isLoadingAllTeams}
      />
    </div>
  );
}
