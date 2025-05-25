
import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { Label } from "@/components/ui/label";

interface AthleteFiltersProps {
  searchFilter: string;
  onSearchFilterChange: (value: string) => void;
  filterType: 'id' | 'name' | 'filial' | 'estado';
  onFilterTypeChange: (value: 'id' | 'name' | 'filial' | 'estado') => void;
  availableBranches?: Array<{ name: string; state: string }>;
  availableStates?: string[];
  selectedBranch?: string;
  onSelectedBranchChange?: (value: string) => void;
  selectedState?: string;
  onSelectedStateChange?: (value: string) => void;
}

export function AthleteFilters({
  searchFilter,
  onSearchFilterChange,
  filterType,
  onFilterTypeChange,
  availableBranches = [],
  availableStates = [],
  selectedBranch,
  onSelectedBranchChange,
  selectedState,
  onSelectedStateChange
}: AthleteFiltersProps) {
  const getPlaceholder = () => {
    switch (filterType) {
      case 'id':
        return 'Buscar por ID (ex: 001, 123)...';
      case 'name':
        return 'Buscar por nome...';
      case 'filial':
        return 'Selecione uma filial acima...';
      case 'estado':
        return 'Selecione um estado acima...';
      default:
        return 'Buscar...';
    }
  };

  const showTextInput = filterType === 'id' || filterType === 'name';
  const showBranchSelect = filterType === 'filial';
  const showStateSelect = filterType === 'estado';

  return (
    <div className="space-y-4 mb-6 bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
        <Filter className="h-5 w-5" />
        Filtros de Atletas
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tipo de Busca</Label>
          <Select
            value={filterType}
            onValueChange={onFilterTypeChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de filtro" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="id">ID do Atleta</SelectItem>
              <SelectItem value="name">Nome do Atleta</SelectItem>
              <SelectItem value="filial">Filial</SelectItem>
              <SelectItem value="estado">Estado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="search-filter">Buscar</Label>
          
          {showTextInput && (
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search-filter"
                placeholder={getPlaceholder()}
                value={searchFilter}
                onChange={(e) => onSearchFilterChange(e.target.value)}
                className="pl-8"
              />
            </div>
          )}

          {showBranchSelect && (
            <Select
              value={selectedBranch || ""}
              onValueChange={(value) => onSelectedBranchChange?.(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma filial" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as filiais</SelectItem>
                {availableBranches.map((branch, index) => (
                  <SelectItem key={index} value={branch.name}>
                    {branch.name} - {branch.state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {showStateSelect && (
            <Select
              value={selectedState || ""}
              onValueChange={(value) => onSelectedStateChange?.(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os estados</SelectItem>
                {availableStates.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </div>
  );
}
