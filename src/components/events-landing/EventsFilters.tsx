
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EventsFiltersProps {
  filterStatus: 'all' | 'open' | 'closed' | 'upcoming';
  setFilterStatus: (status: 'all' | 'open' | 'closed' | 'upcoming') => void;
  sortBy: 'date' | 'name';
  setSortBy: (sort: 'date' | 'name') => void;
}

export function EventsFilters({ filterStatus, setFilterStatus, sortBy, setSortBy }: EventsFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8 p-4 bg-white/50 rounded-lg backdrop-blur-sm">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filtrar por Status
        </label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('all')}
            size="sm"
            className={filterStatus === 'all' ? 'bg-olimpics-green-primary' : ''}
          >
            Todos
          </Button>
          <Button
            variant={filterStatus === 'open' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('open')}
            size="sm"
            className={filterStatus === 'open' ? 'bg-olimpics-green-primary' : ''}
          >
            Inscrições Abertas
          </Button>
          <Button
            variant={filterStatus === 'upcoming' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('upcoming')}
            size="sm"
            className={filterStatus === 'upcoming' ? 'bg-olimpics-green-primary' : ''}
          >
            Em Breve
          </Button>
          <Button
            variant={filterStatus === 'closed' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('closed')}
            size="sm"
            className={filterStatus === 'closed' ? 'bg-olimpics-green-primary' : ''}
          >
            Encerradas
          </Button>
        </div>
      </div>
      
      <div className="sm:w-48">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ordenar por
        </label>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Data</SelectItem>
            <SelectItem value="name">Nome</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
