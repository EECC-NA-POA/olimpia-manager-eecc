
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { TransformedModality, Branch } from '../types';

interface TeamFiltersProps {
  modalities: TransformedModality[];
  branches: Branch[];
  modalityFilter: number | null;
  branchFilter: string | null;
  searchTerm: string;
  setModalityFilter: (filter: number | null) => void;
  setBranchFilter: (filter: string | null) => void;
  setSearchTerm: (term: string) => void;
  showBranchFilter: boolean;
}

export function TeamFilters({
  modalities,
  branches,
  modalityFilter,
  branchFilter,
  searchTerm,
  setModalityFilter,
  setBranchFilter,
  setSearchTerm,
  showBranchFilter
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
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Modality Filter */}
        <Select 
          value={modalityFilter?.toString() || 'all'} 
          onValueChange={(value) => setModalityFilter(value === 'all' ? null : Number(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todas as modalidades" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as modalidades</SelectItem>
            {modalities.map((modality) => (
              <SelectItem key={modality.modalidade_id} value={modality.modalidade_id.toString()}>
                {modality.modalidade_nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Branch Filter */}
        {showBranchFilter && (
          <Select 
            value={branchFilter || 'all'} 
            onValueChange={(value) => setBranchFilter(value === 'all' ? null : value)}
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
        )}
      </div>
    </div>
  );
}
