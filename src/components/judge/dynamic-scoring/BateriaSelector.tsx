
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Plus } from 'lucide-react';
import { useDynamicBaterias } from '../tabs/scores/hooks/useDynamicBaterias';

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
  const { 
    baterias, 
    isLoading, 
    usesBaterias, 
    createNewBateria, 
    createFinalBateria,
    hasFinalBateria,
    isCreating
  } = useDynamicBaterias({ 
    modalityId, 
    eventId 
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-4">
          <div className="text-center">Carregando baterias...</div>
        </CardContent>
      </Card>
    );
  }

  if (!usesBaterias) {
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
            <p className="text-lg font-medium mb-2">Sistema de baterias não configurado</p>
            <p className="text-sm">
              Esta modalidade não usa o sistema de baterias. Configure nas opções do modelo para habilitar.
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
          Gerenciamento de Baterias
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Botões para criar baterias */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={createNewBateria}
              disabled={isCreating}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova Bateria
            </Button>
            
            {!hasFinalBateria && (
              <Button
                variant="outline"
                size="sm"
                onClick={createFinalBateria}
                disabled={isCreating}
                className="flex items-center gap-2"
              >
                <Trophy className="h-4 w-4" />
                Bateria Final
              </Button>
            )}
          </div>

          {baterias.length > 0 && (
            <>
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
                    Global
                  </Badge>
                </Button>
                
                {baterias.map((bateria) => (
                  <Button
                    key={bateria.numero}
                    variant={selectedBateriaId === bateria.numero ? "default" : "outline"}
                    size="sm"
                    onClick={() => onBateriaSelect(bateria.numero)}
                  >
                    {bateria.isFinal ? 'Final' : `Bateria ${bateria.numero}`}
                    {bateria.atletasCount !== undefined && (
                      <Badge variant="secondary" className="ml-2">
                        {bateria.atletasCount}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
              
              {selectedBateriaId && (
                <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                  ℹ️ Calculando colocações apenas para a {baterias.find(b => b.numero === selectedBateriaId)?.isFinal ? 'Bateria Final' : `Bateria ${selectedBateriaId}`}
                </div>
              )}
              
              {!selectedBateriaId && (
                <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                  ℹ️ Calculando colocação final considerando todas as baterias
                </div>
              )}
            </>
          )}

          {baterias.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Nenhuma bateria criada</p>
              <p className="text-sm">
                Crie a primeira bateria usando o botão "Nova Bateria" acima.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
