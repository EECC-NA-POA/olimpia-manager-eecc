
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Users, Search, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Athlete } from '../hooks/useAthletes';

interface BateriaAthleteSelectorProps {
  athletes: Athlete[];
  selectedBateriaId: number | null;
  selectedAthletes: Set<string>;
  onAthleteToggle: (athleteId: string) => void;
  onSelectAll: (filteredAthletes: Athlete[]) => void;
  onClearAll: () => void;
}

export function BateriaAthleteSelector({
  athletes,
  selectedBateriaId,
  selectedAthletes,
  onAthleteToggle,
  onSelectAll,
  onClearAll
}: BateriaAthleteSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredAthletes = athletes.filter(athlete =>
    athlete.atleta_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    athlete.numero_identificador?.includes(searchTerm)
  );

  if (!selectedBateriaId) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Selecione uma bateria para escolher os participantes
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Selecionar Participantes - Bateria {selectedBateriaId === 999 ? 'Final' : selectedBateriaId}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Recolher' : 'Expandir'}
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary">
            {selectedAthletes.size} de {athletes.length} selecionados
          </Badge>
          {selectedAthletes.size > 0 && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              Aparecerão na tabela e grade
            </Badge>
          )}
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Search and controls */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar atleta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onSelectAll(filteredAthletes)}>
                <Check className="h-4 w-4 mr-1" />
                Todos
              </Button>
              <Button variant="outline" size="sm" onClick={onClearAll}>
                <X className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            </div>
          </div>

          {/* Athletes list */}
          <div className="max-h-60 overflow-y-auto border rounded-lg">
            {filteredAthletes.map((athlete) => (
              <div
                key={athlete.atleta_id}
                className="flex items-center space-x-3 p-3 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer"
                onClick={() => onAthleteToggle(athlete.atleta_id)}
              >
                <Checkbox
                  checked={selectedAthletes.has(athlete.atleta_id)}
                  onChange={() => {}} // Controlled by parent click
                />
                <div className="flex-1">
                  <div className="font-medium">{athlete.atleta_nome}</div>
                  {athlete.numero_identificador && (
                    <div className="text-sm text-muted-foreground">
                      #{athlete.numero_identificador}
                    </div>
                  )}
                  {athlete.filial_nome && (
                    <div className="text-xs text-muted-foreground">
                      {athlete.filial_nome}
                    </div>
                  )}
                </div>
                {selectedAthletes.has(athlete.atleta_id) && (
                  <Badge variant="default">
                    Selecionado
                  </Badge>
                )}
              </div>
            ))}
          </div>

          {filteredAthletes.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              Nenhum atleta encontrado com o termo "{searchTerm}"
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
