
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface BranchesHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function BranchesHeader({ searchTerm, onSearchChange, onSave, isSaving }: BranchesHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar filial..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Button 
        onClick={onSave} 
        className="bg-olimpics-green-primary hover:bg-olimpics-green-secondary"
        disabled={isSaving}
      >
        {isSaving ? 'Salvando...' : 'Salvar Alterações'}
      </Button>
    </div>
  );
}
