
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
}

export function AthleteFilters({
  searchFilter,
  onSearchFilterChange,
  filterType,
  onFilterTypeChange
}: AthleteFiltersProps) {
  const getPlaceholder = () => {
    switch (filterType) {
      case 'id':
        return 'Buscar por ID...';
      case 'name':
        return 'Buscar por nome...';
      case 'filial':
        return 'Buscar por filial...';
      case 'estado':
        return 'Buscar por estado...';
      default:
        return 'Buscar...';
    }
  };

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
        </div>
      </div>
    </div>
  );
}
