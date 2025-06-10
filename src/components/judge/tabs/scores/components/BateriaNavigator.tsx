
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Target, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useBateriaData } from '../hooks/useBateriaData';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface BateriaNavigatorProps {
  modalityId: number;
  eventId: string | null;
  selectedBateriaId?: number;
  onBateriaSelect: (bateriaId: number | undefined) => void;
  onCreateBateria?: () => void;
}

interface BateriaStatus {
  id: number;
  numero: number;
  totalAthletes: number;
  scoredAthletes: number;
  status: 'empty' | 'partial' | 'complete';
}

export function BateriaNavigator({
  modalityId,
  eventId,
  selectedBateriaId,
  onBateriaSelect,
  onCreateBateria
}: BateriaNavigatorProps) {
  const { data: baterias = [], isLoading } = useBateriaData(modalityId, eventId);

  // Fetch scoring status for each bateria
  const { data: bateriaStatuses = [] } = useQuery({
    queryKey: ['bateria-statuses', modalityId, eventId],
    queryFn: async () => {
      if (!eventId || !modalityId) return [];

      const statuses: BateriaStatus[] = [];

      for (const bateria of baterias) {
        // Count total athletes in this bateria
        const { data: totalAthletes, error: totalError } = await supabase
          .from('pontuacoes')
          .select('atleta_id', { count: 'exact' })
          .eq('evento_id', eventId)
          .eq('modalidade_id', modalityId)
          .eq('bateria_id', bateria.id);

        // Count athletes with scores
        const { data: scoredAthletes, error: scoredError } = await supabase
          .from('pontuacoes')
          .select('atleta_id', { count: 'exact' })
          .eq('evento_id', eventId)
          .eq('modalidade_id', modalityId)
          .eq('bateria_id', bateria.id)
          .not('valor_pontuacao', 'is', null);

        if (!totalError && !scoredError) {
          const total = totalAthletes?.length || 0;
          const scored = scoredAthletes?.length || 0;
          
          let status: 'empty' | 'partial' | 'complete' = 'empty';
          if (scored > 0 && scored < total) {
            status = 'partial';
          } else if (scored === total && total > 0) {
            status = 'complete';
          }

          statuses.push({
            id: bateria.id,
            numero: bateria.numero,
            totalAthletes: total,
            scoredAthletes: scored,
            status
          });
        }
      }

      return statuses;
    },
    enabled: !!eventId && !!modalityId && baterias.length > 0
  });

  const getStatusIcon = (status: BateriaStatus['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'partial':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: BateriaStatus['status']) => {
    switch (status) {
      case 'complete':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'partial':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-4">
          <div className="text-center">Carregando baterias...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Navegação entre Baterias
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Final/All Baterias Option */}
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
            
            {onCreateBateria && (
              <Button
                variant="outline"
                size="sm"
                onClick={onCreateBateria}
                className="flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Nova Bateria
              </Button>
            )}
          </div>

          {/* Individual Baterias */}
          {baterias.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Baterias Individuais:</div>
              <div className="grid gap-2">
                {baterias.map((bateria) => {
                  const status = bateriaStatuses.find(s => s.id === bateria.id);
                  const isSelected = selectedBateriaId === bateria.id;
                  
                  return (
                    <div
                      key={bateria.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => onBateriaSelect(bateria.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Bateria {bateria.numero}</span>
                          {status && getStatusIcon(status.status)}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {status && (
                            <>
                              <span className="text-xs text-muted-foreground">
                                {status.scoredAthletes}/{status.totalAthletes}
                              </span>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getStatusColor(status.status)}`}
                              >
                                {status.status === 'complete' ? 'Completa' :
                                 status.status === 'partial' ? 'Parcial' : 'Vazia'}
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {status && status.status === 'partial' && (
                        <div className="mt-2 text-xs text-yellow-600">
                          {status.totalAthletes - status.scoredAthletes} atletas pendentes
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {baterias.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Nenhuma bateria configurada</p>
              <p className="text-sm">
                Configure baterias nas regras da modalidade ou crie uma nova bateria.
              </p>
            </div>
          )}

          {/* Selected Bateria Info */}
          {selectedBateriaId && (
            <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
              ℹ️ Pontuando apenas para a Bateria {baterias.find(b => b.id === selectedBateriaId)?.numero}
            </div>
          )}
          
          {!selectedBateriaId && baterias.length > 0 && (
            <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
              ℹ️ Visualizando todas as baterias (modo final)
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
