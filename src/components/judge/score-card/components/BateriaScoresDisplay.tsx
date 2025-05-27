
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface BateriaScore {
  id: number;
  bateria_id: number;
  valor_pontuacao: number | null;
  unidade: string;
  observacoes: string | null;
  bateria_numero?: number;
}

interface BateriaScoresDisplayProps {
  athleteId: string;
  modalityId: number;
  eventId: string;
  judgeId: string;
  baterias: Array<{ id: number; numero: number }>;
  scoreType: 'tempo' | 'distancia' | 'pontos';
}

export function BateriaScoresDisplay({ 
  athleteId, 
  modalityId, 
  eventId, 
  judgeId,
  baterias,
  scoreType 
}: BateriaScoresDisplayProps) {
  const [editingBateria, setEditingBateria] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{[key: string]: any}>({});
  const queryClient = useQueryClient();

  console.log('BateriaScoresDisplay - Props:', { athleteId, modalityId, eventId, baterias });

  // Fetch existing scores for all baterias
  const { data: batteriaScores, isLoading: isLoadingScores } = useQuery({
    queryKey: ['bateria-scores', athleteId, modalityId, eventId],
    queryFn: async () => {
      console.log('Fetching bateria scores for:', { athleteId, modalityId, eventId });
      
      const { data, error } = await supabase
        .from('pontuacoes')
        .select('id, bateria_id, valor_pontuacao, unidade, observacoes')
        .eq('evento_id', eventId)
        .eq('modalidade_id', modalityId)
        .eq('atleta_id', athleteId)
        .order('bateria_id');
      
      if (error) {
        console.error('Error fetching bateria scores:', error);
        return [];
      }
      
      console.log('Fetched bateria scores raw data:', data);
      
      // Map the scores to include bateria info
      const mappedScores = (data || []).map(score => ({
        ...score,
        bateria_numero: baterias.find(b => b.id === score.bateria_id)?.numero || 0
      }));
      
      console.log('Mapped bateria scores:', mappedScores);
      return mappedScores as BateriaScore[];
    },
    enabled: !!athleteId && !!modalityId && !!eventId && baterias.length > 0,
  });

  // Update score mutation
  const updateScoreMutation = useMutation({
    mutationFn: async ({ scoreId, newValues }: { scoreId: number, newValues: any }) => {
      console.log('Updating score:', scoreId, newValues);
      
      const { data, error } = await supabase
        .from('pontuacoes')
        .update({
          ...newValues,
          juiz_id: judgeId,
          data_registro: new Date().toISOString()
        })
        .eq('id', scoreId)
        .select('*');
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bateria-scores', athleteId, modalityId, eventId] });
      queryClient.invalidateQueries({ queryKey: ['bateria-scores-check', athleteId, modalityId, eventId] });
      queryClient.invalidateQueries({ queryKey: ['scores', modalityId, eventId] });
      setEditingBateria(null);
      setEditValues({});
      toast.success('Pontuação atualizada com sucesso');
    },
    onError: (error: any) => {
      console.error('Error updating score:', error);
      toast.error(`Erro ao atualizar pontuação: ${error.message}`);
    }
  });

  const handleEdit = (bateriaId: number, currentScore: BateriaScore) => {
    setEditingBateria(bateriaId);
    setEditValues({
      valor_pontuacao: currentScore.valor_pontuacao || '',
      observacoes: currentScore.observacoes || ''
    });
  };

  const handleSave = (scoreId: number) => {
    const cleanedValues = { ...editValues };
    
    // Convert empty strings to null for numeric fields
    if (cleanedValues.valor_pontuacao === '') cleanedValues.valor_pontuacao = null;
    if (cleanedValues.observacoes === '') cleanedValues.observacoes = null;
    
    updateScoreMutation.mutate({ scoreId, newValues: cleanedValues });
  };

  const handleCancel = () => {
    setEditingBateria(null);
    setEditValues({});
  };

  const formatScoreDisplay = (score: BateriaScore) => {
    if (scoreType === 'tempo') {
      // Convert milliseconds back to readable format
      const totalMs = score.valor_pontuacao || 0;
      const minutes = Math.floor(totalMs / 60000);
      const seconds = Math.floor((totalMs % 60000) / 1000);
      const ms = totalMs % 1000;
      
      if (minutes > 0) {
        return `${minutes}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
      } else {
        return `${seconds}.${ms.toString().padStart(3, '0')}s`;
      }
    } else if (scoreType === 'distancia') {
      const value = score.valor_pontuacao || 0;
      return `${value.toFixed(2)}m`;
    } else {
      return score.valor_pontuacao ? `${score.valor_pontuacao} ${score.unidade}` : 'Não registrado';
    }
  };

  const getScoreInputField = (score: BateriaScore) => {
    if (scoreType === 'tempo') {
      // For time, show the raw milliseconds value for editing
      return (
        <Input
          type="number"
          placeholder="Milissegundos"
          value={editValues.valor_pontuacao}
          onChange={(e) => setEditValues(prev => ({ ...prev, valor_pontuacao: Number(e.target.value) }))}
          className="w-24 h-8"
        />
      );
    } else {
      return (
        <Input
          type="number"
          step="0.01"
          placeholder="Valor"
          value={editValues.valor_pontuacao}
          onChange={(e) => setEditValues(prev => ({ ...prev, valor_pontuacao: Number(e.target.value) }))}
          className="w-20 h-8"
        />
      );
    }
  };

  if (isLoadingScores) {
    return (
      <Card className="mt-4">
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">Carregando pontuações...</p>
        </CardContent>
      </Card>
    );
  }

  // Show all baterias with their scores (if any)
  return (
    <Card className="mt-4 border-blue-200 bg-blue-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-blue-800">Pontuações por Bateria</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {baterias.map((bateria) => {
          const score = batteriaScores?.find(s => s.bateria_id === bateria.id);
          const isEditing = editingBateria === bateria.id;
          
          if (!score) {
            return (
              <div key={bateria.id} className="flex items-center justify-between p-2 border rounded bg-gray-50">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-white">Bateria {bateria.numero}</Badge>
                  <span className="text-sm text-gray-500">Não registrado</span>
                </div>
              </div>
            );
          }
          
          return (
            <div key={bateria.id} className="flex items-center justify-between p-2 border rounded bg-white">
              <div className="flex items-center gap-2 flex-1">
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  Bateria {bateria.numero}
                </Badge>
                {!isEditing ? (
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{formatScoreDisplay(score)}</span>
                    {score.observacoes && (
                      <span className="text-xs text-gray-500">{score.observacoes}</span>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-2 items-center">
                    {getScoreInputField(score)}
                    <Input
                      placeholder="Observações"
                      value={editValues.observacoes}
                      onChange={(e) => setEditValues(prev => ({ ...prev, observacoes: e.target.value }))}
                      className="w-24 h-8 text-xs"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex gap-1">
                {!isEditing ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(bateria.id, score)}
                    className="h-6 w-6 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSave(score.id)}
                      disabled={updateScoreMutation.isPending}
                      className="h-6 w-6 p-0"
                    >
                      <Save className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCancel}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
