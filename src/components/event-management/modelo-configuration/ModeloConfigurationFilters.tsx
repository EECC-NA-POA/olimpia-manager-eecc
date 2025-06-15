
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

interface ModeloConfigurationFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  modalityFilter: string;
  onModalityFilterChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  useBatteryFilter: string;
  onUseBatteryFilterChange: (value: string) => void;
  modalities: Array<{ id: number; nome: string }>;
  categories: Array<string>;
}

export function ModeloConfigurationFilters({
  searchTerm,
  onSearchChange,
  modalityFilter,
  onModalityFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  useBatteryFilter,
  onUseBatteryFilterChange,
  modalities,
  categories
}: ModeloConfigurationFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
        <Input
          placeholder="Buscar por modelo ou descrição..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Select value={modalityFilter} onValueChange={onModalityFilterChange}>
        <SelectTrigger className="w-full md:w-[220px]">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Filtrar por modalidade" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as modalidades</SelectItem>
          {modalities.map((modality) => (
            <SelectItem key={modality.id} value={modality.id.toString()}>
              {modality.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Filtrar por categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as categorias</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={useBatteryFilter} onValueChange={onUseBatteryFilterChange}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Filtrar por baterias" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="true">Usa Baterias</SelectItem>
          <SelectItem value="false">Não Usa Baterias</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
