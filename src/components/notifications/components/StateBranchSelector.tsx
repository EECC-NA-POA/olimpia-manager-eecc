
import React from 'react';
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useEventBranches } from '@/hooks/useEventBranches';

interface Branch {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
}

interface GroupedBranches {
  [estado: string]: Branch[];
}

interface StateBranchSelectorProps {
  eventId: string;
  selectedBranches: string[];
  onBranchChange: (branches: string[]) => void;
  expandedStates: Record<string, boolean>;
  onToggleState: (estado: string) => void;
}

export function StateBranchSelector({ 
  eventId,
  selectedBranches, 
  onBranchChange,
  expandedStates,
  onToggleState
}: StateBranchSelectorProps) {
  const { data: branches, isLoading } = useEventBranches(eventId);

  if (isLoading) {
    return <div className="text-sm text-gray-500">Carregando filiais...</div>;
  }

  if (!branches) {
    return <div className="text-sm text-red-500">Erro ao carregar filiais</div>;
  }

  // Agrupar filiais por estado
  const groupedBranches: GroupedBranches = branches.reduce((groups, branch) => {
    if (!groups[branch.estado]) {
      groups[branch.estado] = [];
    }
    groups[branch.estado].push(branch);
    return groups;
  }, {} as GroupedBranches);

  const sortedStates = Object.keys(groupedBranches).sort();

  const handleBranchToggle = (branchId: string) => {
    const newSelection = selectedBranches.includes(branchId)
      ? selectedBranches.filter(id => id !== branchId && id !== 'all')
      : [...selectedBranches.filter(id => id !== 'all'), branchId];
    
    onBranchChange(newSelection);
  };

  const handleSelectAllBranches = (checked: boolean) => {
    if (checked) {
      onBranchChange(['all']);
    } else {
      onBranchChange([]);
    }
  };

  const handleStateToggle = (estado: string) => {
    const stateBranches = groupedBranches[estado];
    const stateBranchIds = stateBranches.map(b => b.id);
    const allStateSelected = stateBranchIds.every(id => selectedBranches.includes(id));
    
    if (allStateSelected) {
      // Desselecionar todas as filiais do estado
      const newSelection = selectedBranches.filter(id => !stateBranchIds.includes(id) && id !== 'all');
      onBranchChange(newSelection);
    } else {
      // Selecionar todas as filiais do estado
      const newSelection = [...new Set([...selectedBranches.filter(id => id !== 'all'), ...stateBranchIds])];
      onBranchChange(newSelection);
    }
  };

  const isStateFullySelected = (estado: string): boolean => {
    const stateBranchIds = groupedBranches[estado].map(b => b.id);
    return stateBranchIds.every(id => selectedBranches.includes(id));
  };

  const isStatePartiallySelected = (estado: string): boolean => {
    const stateBranchIds = groupedBranches[estado].map(b => b.id);
    const selectedCount = stateBranchIds.filter(id => selectedBranches.includes(id)).length;
    return selectedCount > 0 && selectedCount < stateBranchIds.length;
  };

  const isAllSelected = selectedBranches.includes('all');

  return (
    <div>
      <Label className="text-sm font-medium">Destinatários *</Label>
      <div className="mt-2 space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-md p-3">
        {/* Opção "Todas as filiais" */}
        <div className="flex items-center space-x-2 pb-2 border-b">
          <Checkbox
            id="all-branches"
            checked={isAllSelected}
            onCheckedChange={handleSelectAllBranches}
          />
          <Label htmlFor="all-branches" className="font-medium text-green-700">
            Todas as filiais
          </Label>
        </div>
        
        {/* Estados com filiais */}
        <div className="space-y-2">
          {sortedStates.map((estado) => {
            const stateBranches = groupedBranches[estado];
            const isExpanded = expandedStates[estado];
            const isFullySelected = isStateFullySelected(estado);
            const isPartiallySelected = isStatePartiallySelected(estado);
            
            return (
              <Collapsible key={estado} open={isExpanded} onOpenChange={() => onToggleState(estado)}>
                <div className="border rounded-lg">
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-3 hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={isFullySelected ? true : isPartiallySelected ? 'indeterminate' : false}
                          onCheckedChange={() => handleStateToggle(estado)}
                          onClick={(e) => e.stopPropagation()}
                          disabled={isAllSelected}
                        />
                        <span className="font-medium text-sm">{estado}</span>
                        <span className="text-xs text-muted-foreground">
                          ({stateBranches.filter(b => selectedBranches.includes(b.id)).length}/{stateBranches.length} selecionadas)
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">
                          {stateBranches.length} filiais
                        </span>
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="border-t p-2 space-y-1">
                      {stateBranches
                        .sort((a, b) => a.nome.localeCompare(b.nome))
                        .map((branch) => (
                          <div key={branch.id} className="flex items-center space-x-2 pl-6">
                            <Checkbox
                              id={branch.id}
                              checked={selectedBranches.includes(branch.id)}
                              onCheckedChange={() => handleBranchToggle(branch.id)}
                              disabled={isAllSelected}
                            />
                            <Label htmlFor={branch.id} className="text-sm">
                              {branch.nome} - {branch.cidade}
                            </Label>
                          </div>
                        ))}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </div>
      </div>
    </div>
  );
}
