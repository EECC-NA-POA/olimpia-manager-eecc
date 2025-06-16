
import React from 'react';
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useBranches } from '@/hooks/useBranches';

interface BranchSelectorProps {
  selectedBranches: string[];
  onBranchChange: (branches: string[]) => void;
  isOrganizer: boolean;
  userBranchId?: string;
}

export function BranchSelector({ 
  selectedBranches, 
  onBranchChange, 
  isOrganizer,
  userBranchId 
}: BranchSelectorProps) {
  const { data: branches, isLoading } = useBranches();

  if (isLoading) {
    return <div className="text-sm text-gray-500">Carregando filiais...</div>;
  }

  if (!branches) {
    return <div className="text-sm text-red-500">Erro ao carregar filiais</div>;
  }

  const handleBranchToggle = (branchId: string) => {
    if (branchId === 'all') {
      // Se "todas" foi selecionada, limpar outras seleções
      onBranchChange(['all']);
    } else {
      const newSelection = selectedBranches.includes(branchId)
        ? selectedBranches.filter(id => id !== branchId && id !== 'all')
        : [...selectedBranches.filter(id => id !== 'all'), branchId];
      
      onBranchChange(newSelection);
    }
  };

  // Se é representante de delegação, só mostrar sua filial
  if (!isOrganizer && userBranchId) {
    const userBranch = branches.find(b => b.id === userBranchId);
    return (
      <div>
        <Label className="text-sm font-medium">Destinatário</Label>
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-700">
            Esta notificação será enviada para sua filial: <strong>{userBranch?.nome}</strong>
          </p>
        </div>
      </div>
    );
  }

  // Se é organizador, mostrar todas as opções
  return (
    <div>
      <Label className="text-sm font-medium">Destinatários *</Label>
      <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="all-branches"
            checked={selectedBranches.includes('all')}
            onCheckedChange={() => handleBranchToggle('all')}
          />
          <Label htmlFor="all-branches" className="font-medium text-green-700">
            Todas as filiais
          </Label>
        </div>
        
        <div className="border-t pt-2">
          {branches.map((branch) => (
            <div key={branch.id} className="flex items-center space-x-2">
              <Checkbox
                id={branch.id}
                checked={selectedBranches.includes(branch.id)}
                onCheckedChange={() => handleBranchToggle(branch.id)}
                disabled={selectedBranches.includes('all')}
              />
              <Label htmlFor={branch.id} className="text-sm">
                {branch.nome} - {branch.cidade}/{branch.estado}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
