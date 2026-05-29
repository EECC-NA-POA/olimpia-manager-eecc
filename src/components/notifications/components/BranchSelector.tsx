
import React from 'react';
import { Label } from "@/components/ui/label";
import { StateBranchSelector } from './StateBranchSelector';
import { useStateBranchSelection } from '../hooks/useStateBranchSelection';
import { useBranches } from '@/hooks/useBranches';

interface BranchSelectorProps {
  eventId: string;
  selectedBranches: string[];
  onBranchChange: (branches: string[]) => void;
  isOrganizer: boolean;
  userBranchIds?: string[];
}

export function BranchSelector({
  eventId,
  selectedBranches,
  onBranchChange,
  isOrganizer,
  userBranchIds
}: BranchSelectorProps) {
  const { data: branches, isLoading } = useBranches();
  const { expandedStates, handleToggleState } = useStateBranchSelection();

  if (isLoading) {
    return <div className="text-sm text-gray-500">Carregando filiais...</div>;
  }

  if (!branches) {
    return <div className="text-sm text-red-500">Erro ao carregar filiais</div>;
  }

  // Se é representante de delegação, mostrar todas as filiais da delegação
  if (!isOrganizer && userBranchIds && userBranchIds.length > 0) {
    const userBranches = branches.filter(b => userBranchIds.includes(b.id));
    return (
      <div>
        <Label className="text-sm font-medium">Destinatário</Label>
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-700">
            {userBranches.length === 1 ? (
              <>Esta notificação será enviada para sua filial: <strong>{userBranches[0]?.nome}</strong></>
            ) : (
              <>
                Esta notificação será enviada para as filiais da delegação:
                <strong className="block mt-1">
                  {userBranches.map(b => b.nome).join(', ')}
                </strong>
              </>
            )}
          </p>
        </div>
      </div>
    );
  }

  // Se é organizador, usar o novo seletor por estados
  return (
    <StateBranchSelector
      eventId={eventId}
      selectedBranches={selectedBranches}
      onBranchChange={onBranchChange}
      expandedStates={expandedStates}
      onToggleState={handleToggleState}
    />
  );
}
