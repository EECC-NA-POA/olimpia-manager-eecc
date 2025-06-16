
import React from 'react';
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { NotificationTargetType } from '@/types/notifications';

interface Branch {
  id: number;
  nome: string;
  estado: string;
}

interface BranchSelectionProps {
  isOrganizer: boolean;
  isBranchFiltered: boolean;
  tipoDestinatario: NotificationTargetType;
  branches: Branch[];
  selectedBranches: number[];
  loadingBranches: boolean;
  handleBranchToggle: (branchId: number) => void;
}

export function BranchSelection({
  isOrganizer,
  isBranchFiltered,
  tipoDestinatario,
  branches,
  selectedBranches,
  loadingBranches,
  handleBranchToggle
}: BranchSelectionProps) {
  // Seleção de filiais - apenas para organizadores quando tipo é 'filial'
  if (!isOrganizer || isBranchFiltered || tipoDestinatario !== 'filial') {
    return null;
  }

  return (
    <div>
      <Label>Filiais Destinatárias *</Label>
      <div className="border rounded-md p-4 max-h-40 overflow-y-auto space-y-2">
        {loadingBranches ? (
          <p className="text-sm text-gray-500">Carregando filiais...</p>
        ) : (
          branches.map((branch) => (
            <div key={branch.id} className="flex items-center space-x-2">
              <Checkbox
                id={`branch-${branch.id}`}
                checked={selectedBranches.includes(branch.id)}
                onCheckedChange={() => handleBranchToggle(branch.id)}
              />
              <Label htmlFor={`branch-${branch.id}`} className="text-sm">
                {branch.nome} - {branch.estado}
              </Label>
            </div>
          ))
        )}
      </div>
      {selectedBranches.length > 0 && (
        <p className="text-sm text-gray-600 mt-2">
          {selectedBranches.length} filial(is) selecionada(s)
        </p>
      )}
    </div>
  );
}
