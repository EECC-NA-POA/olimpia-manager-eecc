
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target } from 'lucide-react';
import { useBateriaData } from '../tabs/scores/hooks/useBateriaData';

interface BateriaSelectorProps {
  modalityId: number;
  eventId: string;
  selectedBateriaId?: number;
  onBateriaSelect: (bateriaId: number | undefined) => void;
}

export function BateriaSelector({
  modalityId,
  eventId,
  selectedBateriaId,
  onBateriaSelect
}: BateriaSelectorProps) {
  const { data: baterias = [], isLoading } = useBateriaData(modalityId, eventId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-4">
          <div className="text-center">Carregando baterias...</div>
        </CardContent>
      </Card>
    );
  }

  if (baterias.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Seleção de Bateria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Nenhuma bateria configurada</p>
            <p className="text-sm">
              Configure baterias nas regras da modalidade para habilitar o cálculo por bateria.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Seleção de Bateria
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            Selecione uma bateria específica ou calcule para todas:
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedBateriaId === undefined ? "default" : "outline"}
              size="sm"
              onClick={() => onBateriaSelect(undefined)}
            >
              Todas as Baterias
              <Badge variant="secondary" className="ml-2">
                Final
              </Badge>
            </Button>
            
            {baterias.map((bateria) => (
              <Button
                key={bateria.id}
                variant={selectedBateriaId === bateria.id ? "default" : "outline"}
                size="sm"
                onClick={() => onBateriaSelect(bateria.id)}
              >
                Bateria {bateria.numero}
              </Button>
            ))}
          </div>
          
          {selectedBateriaId && (
            <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
              ℹ️ Calculando colocações apenas para a Bateria {baterias.find(b => b.id === selectedBateriaId)?.numero}
            </div>
          )}
          
          {!selectedBateriaId && (
            <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
              ℹ️ Calculando colocação final considerando todas as baterias
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
