
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ModalityOption } from '../types';

interface Branch {
  id: string;
  nome: string;
}

interface TeamFiltersProps {
  modalities: ModalityOption[];
  branches: Branch[];
  selectedModalityId: number | null;
  selectedBranchId: string | null;
  searchTerm: string;
  onModalityChange: (modalityId: number | null) => void;
  onBranchChange: (branchId: string | null) => void;
  onSearchChange: (term: string) => void;
}

export function TeamFilters({
  modalities,
  branches,
  selectedModalityId,
  selectedBranchId,
  searchTerm,
  onModalityChange,
  onBranchChange,
  onSearchChange
}: TeamFiltersProps) {
  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-medium">Filtros</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome da equipe"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Modality Filter */}
        <Select 
          value={selectedModalityId?.toString() || 'all'} 
          onValueChange={(value) => onModalityChange(value === 'all' ? null : Number(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todas as modalidades" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as modalidades</SelectItem>
            {modalities.map((modality) => (
              <SelectItem key={modality.id} value={modality.id.toString()}>
                {modality.nome} - {modality.categoria}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Branch Filter */}
        <Select 
          value={selectedBranchId || 'all'} 
          onValueChange={(value) => onBranchChange(value === 'all' ? null : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todas as filiais" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as filiais</SelectItem>
            {branches.map((branch) => (
              <SelectItem key={branch.id} value={branch.id}>
                {branch.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
