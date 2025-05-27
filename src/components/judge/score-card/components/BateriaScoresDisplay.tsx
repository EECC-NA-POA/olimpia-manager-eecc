
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
  tempo_minutos: number | null;
  tempo_segundos: number | null;
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

  // Fetch existing scores for all baterias
  const { data: batteriaScores } = useQuery({
    queryKey: ['bateria-scores', athleteId, modalityId, eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pontuacoes')
        .select('id, bateria_id, valor_pontuacao, tempo_minutos, tempo_segundos, unidade, observacoes')
        .eq('evento_id', eventId)
        .eq('modalidade_id', modalityId)
        .eq('atleta_id', athleteId)
        .order('bateria_id');
      
      if (error) {
        console.error('Error fetching bateria scores:', error);
        return [];
      }
      
      return data as BateriaScore[];
    },
    enabled: !!athleteId && !!modalityId && !!eventId,
  });

  // Update score mutation
  const updateScoreMutation = useMutation({
    mutationFn: async ({ scoreId, newValues }: { scoreId: number, newValues: any }) => {
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
      queryClient.invalidateQueries({ queryKey: ['scores', modalityId, eventId] });
      setEditingBateria(null);
      setEditValues({});
      toast.success('Pontuação atualizada com sucesso');
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar pontuação: ${error.message}`);
    }
  });

  const handleEdit = (bateriaId: number, currentScore: BateriaScore) => {
    setEditingBateria(bateriaId);
    setEditValues({
      valor_pontuacao: currentScore.valor_pontuacao || '',
      tempo_minutos: currentScore.tempo_minutos || '',
      tempo_segundos: currentScore.tempo_segundos || '',
      observacoes: currentScore.observacoes || ''
    });
  };

  const handleSave = (scoreId: number) => {
    const cleanedValues = { ...editValues };
    
    // Convert empty strings to null for numeric fields
    if (cleanedValues.valor_pontuacao === '') cleanedValues.valor_pontuacao = null;
    if (cleanedValues.tempo_minutos === '') cleanedValues.tempo_minutos = null;
    if (cleanedValues.tempo_segundos === '') cleanedValues.tempo_segundos = null;
    if (cleanedValues.observacoes === '') cleanedValues.observacoes = null;
    
    updateScoreMutation.mutate({ scoreId, newValues: cleanedValues });
  };

  const handleCancel = () => {
    setEditingBateria(null);
    setEditValues({});
  };

  const formatScoreDisplay = (score: BateriaScore) => {
    if (scoreType === 'tempo') {
      const minutes = score.tempo_minutos || 0;
      const seconds = score.tempo_segundos || 0;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } else if (scoreType === 'distancia' || scoreType === 'pontos') {
      return score.valor_pontuacao ? `${score.valor_pontuacao} ${score.unidade}` : 'Não registrado';
    }
    return 'Não registrado';
  };

  if (!batteriaScores || batteriaScores.length === 0) {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm">Pontuações por Bateria</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {baterias.map((bateria) => {
          const score = batteriaScores.find(s => s.bateria_id === bateria.id);
          const isEditing = editingBateria === bateria.id;
          
          if (!score) return null;
          
          return (
            <div key={bateria.id} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Bateria {bateria.numero}</Badge>
                {!isEditing ? (
                  <span className="text-sm">{formatScoreDisplay(score)}</span>
                ) : (
                  <div className="flex gap-2">
                    {scoreType === 'tempo' ? (
                      <>
                        <Input
                          type="number"
                          placeholder="Min"
                          value={editValues.tempo_minutos}
                          onChange={(e) => setEditValues(prev => ({ ...prev, tempo_minutos: Number(e.target.value) }))}
                          className="w-16 h-8"
                        />
                        <Input
                          type="number"
                          placeholder="Seg"
                          value={editValues.tempo_segundos}
                          onChange={(e) => setEditValues(prev => ({ ...prev, tempo_segundos: Number(e.target.value) }))}
                          className="w-16 h-8"
                        />
                      </>
                    ) : (
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Valor"
                        value={editValues.valor_pontuacao}
                        onChange={(e) => setEditValues(prev => ({ ...prev, valor_pontuacao: Number(e.target.value) }))}
                        className="w-20 h-8"
                      />
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex gap-1">
                {!isEditing ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(bateria.id, score)}
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
                    >
                      <Save className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCancel}
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
