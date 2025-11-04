
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';

interface BranchesHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSave: () => void;
  isSaving: boolean;
  onNewBranch: () => void;
}

export function BranchesHeader({ searchTerm, onSearchChange, onSave, isSaving, onNewBranch }: BranchesHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar filial..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        <Button 
          onClick={onNewBranch}
          variant="outline"
          className="flex-1 sm:flex-none"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Filial
        </Button>
        <Button 
          onClick={onSave} 
          className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary flex-1 sm:flex-none"
          disabled={isSaving}
        >
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </div>
  );
}
