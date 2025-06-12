
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trophy, Target } from 'lucide-react';
import { DynamicBateria } from '../hooks/useDynamicBaterias';

interface BateriaNavigationTabsProps {
  regularBaterias: DynamicBateria[];
  finalBateria?: DynamicBateria;
  selectedBateriaId: number | null;
  onSelectBateria: (numero: number) => void;
  onCreateNewBateria: () => void;
  onCreateFinalBateria: () => void;
  hasFinalBateria: boolean;
  isCreating: boolean;
  usesBaterias: boolean;
}

export function BateriaNavigationTabs({
  regularBaterias,
  finalBateria,
  selectedBateriaId,
  onSelectBateria,
  onCreateNewBateria,
  onCreateFinalBateria,
  hasFinalBateria,
  isCreating,
  usesBaterias
}: BateriaNavigationTabsProps) {
  if (!usesBaterias) return null;

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
          {/* Regular Baterias */}
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-2">Baterias Regulares</div>
            <div className="flex flex-wrap gap-2">
              {regularBaterias.map((bateria) => (
                <Button
                  key={bateria.numero}
                  variant={selectedBateriaId === bateria.numero ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSelectBateria(bateria.numero)}
                >
                  Bateria {bateria.numero}
                  {bateria.atletasCount !== undefined && (
                    <Badge variant="secondary" className="ml-2">
                      {bateria.atletasCount}
                    </Badge>
                  )}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={onCreateNewBateria}
                disabled={isCreating}
                className="border-dashed"
              >
                <Plus className="h-4 w-4 mr-1" />
                Nova Bateria
              </Button>
            </div>
          </div>

          {/* Final Bateria */}
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-2">Bateria Final</div>
            <div className="flex gap-2">
              {finalBateria ? (
                <Button
                  variant={selectedBateriaId === finalBateria.numero ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSelectBateria(finalBateria.numero)}
                  className="bg-gold/10 border-gold text-gold-foreground"
                >
                  <Trophy className="h-4 w-4 mr-1" />
                  Bateria Final
                  {finalBateria.atletasCount !== undefined && (
                    <Badge variant="secondary" className="ml-2">
                      {finalBateria.atletasCount}
                    </Badge>
                  )}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCreateFinalBateria}
                  disabled={isCreating || regularBaterias.length === 0}
                  className="border-dashed border-gold text-gold"
                >
                  <Trophy className="h-4 w-4 mr-1" />
                  Criar Bateria Final
                </Button>
              )}
            </div>
            {regularBaterias.length === 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Crie pelo menos uma bateria regular antes da final
              </p>
            )}
          </div>

          {/* Current Selection Info */}
          {selectedBateriaId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {regularBaterias.find(b => b.numero === selectedBateriaId) 
                    ? `Bateria ${selectedBateriaId}`
                    : finalBateria?.numero === selectedBateriaId 
                    ? 'Bateria Final'
                    : 'Bateria Selecionada'
                  }
                </Badge>
                <span className="text-sm text-blue-700">
                  {finalBateria?.numero === selectedBateriaId 
                    ? 'Determine os ganhadores finais'
                    : 'Registre as pontuações desta bateria'
                  }
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
