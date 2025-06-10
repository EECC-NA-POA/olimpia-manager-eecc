
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface AthleteFiltersProps {
  searchFilter: string;
  onSearchFilterChange: (value: string) => void;
  filterType: 'all' | 'scored' | 'unscored';
  onFilterTypeChange: (value: 'all' | 'scored' | 'unscored') => void;
  availableBranches: string[];
  availableStates: string[];
  selectedBranch: string;
  onSelectedBranchChange: (value: string) => void;
  selectedState: string;
  onSelectedStateChange: (value: string) => void;
  statusFilter: 'all' | 'scored' | 'unscored';
  onStatusFilterChange: (value: 'all' | 'scored' | 'unscored') => void;
}

export function AthleteFilters({
  searchFilter,
  onSearchFilterChange,
  filterType,
  onFilterTypeChange,
  availableBranches,
  availableStates,
  selectedBranch,
  onSelectedBranchChange,
  selectedState,
  onSelectedStateChange,
  statusFilter,
  onStatusFilterChange
}: AthleteFiltersProps) {
  const isMobile = useIsMobile();

  const hasActiveFilters = searchFilter || selectedBranch !== 'all' || selectedState !== 'all' || statusFilter !== 'all';

  const resetFilters = () => {
    onSearchFilterChange('');
    onSelectedBranchChange('all');
    onSelectedStateChange('all');
    onStatusFilterChange('all');
  };

  return (
    <div className={`space-y-3 ${isMobile ? 'space-y-3' : 'space-y-4'}`}>
      {/* Search and Reset */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar atleta..."
            value={searchFilter}
            onChange={(e) => onSearchFilterChange(e.target.value)}
            className={`pl-10 ${isMobile ? 'text-sm h-9' : ''}`}
          />
        </div>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size={isMobile ? "sm" : "default"}
            onClick={resetFilters}
            className={`flex items-center gap-2 ${isMobile ? 'px-3 h-9' : ''}`}
          >
            <X className="h-4 w-4" />
            {!isMobile && <span>Limpar</span>}
          </Button>
        )}
      </div>

      {/* Filters Grid */}
      <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className={isMobile ? 'h-9 text-sm' : ''}>
            <SelectValue placeholder="Status da pontuação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="scored">Já pontuados</SelectItem>
            <SelectItem value="unscored">Não pontuados</SelectItem>
          </SelectContent>
        </Select>

        {/* Branch Filter */}
        {availableBranches.length > 0 && (
          <Select value={selectedBranch} onValueChange={onSelectedBranchChange}>
            <SelectTrigger className={isMobile ? 'h-9 text-sm' : ''}>
              <SelectValue placeholder="Filial" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px] overflow-y-auto">
              <SelectItem value="all">Todas as filiais</SelectItem>
              {availableBranches.map((branch) => (
                <SelectItem key={branch} value={branch}>
                  {branch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* State Filter */}
        {availableStates.length > 0 && (
          <Select value={selectedState} onValueChange={onSelectedStateChange}>
            <SelectTrigger className={isMobile ? 'h-9 text-sm' : ''}>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px] overflow-y-auto">
              <SelectItem value="all">Todos os estados</SelectItem>
              {availableStates.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Active Filters Summary (Mobile) */}
      {isMobile && hasActiveFilters && (
        <div className="flex flex-wrap gap-2 text-xs">
          {searchFilter && (
            <span className="bg-muted px-2 py-1 rounded">
              Busca: {searchFilter}
            </span>
          )}
          {selectedBranch !== 'all' && (
            <span className="bg-muted px-2 py-1 rounded">
              Filial: {selectedBranch}
            </span>
          )}
          {selectedState !== 'all' && (
            <span className="bg-muted px-2 py-1 rounded">
              Estado: {selectedState}
            </span>
          )}
          {statusFilter !== 'all' && (
            <span className="bg-muted px-2 py-1 rounded">
              Status: {statusFilter === 'scored' ? 'Pontuados' : 'Não pontuados'}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
