
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Users } from 'lucide-react';
import { Athlete } from '../../../hooks/useAthletes';

interface UnscoredAthletesSectionProps {
  athletes: Athlete[];
  selectedBateriaId: number | null;
  selectedUnscored: Set<string>;
  onUnscoredSelection: (athleteId: string, checked: boolean) => void;
  onSelectAllUnscored: () => void;
  onDeselectAllUnscored: () => void;
  onAddSelectedToTable: () => void;
}

export function UnscoredAthletesSection({
  athletes,
  selectedBateriaId,
  selectedUnscored,
  onUnscoredSelection,
  onSelectAllUnscored,
  onDeselectAllUnscored,
  onAddSelectedToTable
}: UnscoredAthletesSectionProps) {
  const getBateriaDisplayName = (bateriaId: number | null) => {
    if (bateriaId === 999) return 'Final';
    return bateriaId?.toString() || '';
  };

  if (!selectedBateriaId || athletes.length === 0) {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Atletas sem pontuação na bateria {getBateriaDisplayName(selectedBateriaId)}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Selecione os atletas que deseja adicionar à tabela de pontuação:
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Bulk selection controls */}
          <div className="flex gap-2 pb-3 border-b">
            <Button
              variant="outline"
              size="sm"
              onClick={onSelectAllUnscored}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Selecionar todos ({athletes.length})
            </Button>
            {selectedUnscored.size > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDeselectAllUnscored}
              >
                Desmarcar todos
              </Button>
            )}
          </div>

          {athletes.map((athlete) => (
            <div key={athlete.atleta_id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
              <Checkbox
                checked={selectedUnscored.has(athlete.atleta_id)}
                onCheckedChange={(checked) => 
                  onUnscoredSelection(athlete.atleta_id, checked as boolean)
                }
              />
              <div className="flex-1">
                <div className="font-medium">{athlete.atleta_nome}</div>
                <div className="text-sm text-muted-foreground">
                  {athlete.tipo_documento}: {athlete.numero_documento} | {athlete.filial_nome || 'N/A'}
                </div>
              </div>
            </div>
          ))}
          
          {selectedUnscored.size > 0 && (
            <div className="pt-3 border-t">
              <Button 
                onClick={onAddSelectedToTable}
                className="w-full"
              >
                Adicionar {selectedUnscored.size} atleta(s) à tabela de pontuação
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
