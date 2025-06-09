import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, RefreshCw } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface CalculatedFieldsManagerProps {
  modeloId: number;
  modalityId: number;
  eventId: string;
  bateriaId?: number;
  onCalculationComplete?: (results: any[]) => void;
}

export function CalculatedFieldsManager({
  modeloId,
  modalityId,
  eventId,
  bateriaId,
  onCalculationComplete
}: CalculatedFieldsManagerProps) {
  const queryClient = useQueryClient();
  const [isCalculating, setIsCalculating] = useState(false);

  // Fetch calculated fields from model
  const { data: calculatedFields = [] } = useQuery({
    queryKey: ['calculated-fields', modeloId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campos_modelo')
        .select('*')
        .eq('modelo_id', modeloId)
        .eq('tipo_input', 'calculated')
        .order('ordem_exibicao');

      if (error) throw error;
      return data;
    },
    enabled: !!modeloId
  });

  // Fetch current scores for ranking calculation
  const { data: scores = [] } = useQuery({
    queryKey: ['modality-scores-for-ranking', modalityId, eventId, bateriaId],
    queryFn: async () => {
      let query = supabase
        .from('pontuacoes')
        .select(`
          *,
          usuarios!pontuacoes_atleta_id_fkey(nome_completo)
        `)
        .eq('modalidade_id', modalityId)
        .eq('evento_id', eventId)
        .eq('modelo_id', modeloId);

      if (bateriaId) {
        query = query.eq('numero_bateria', bateriaId);
      }

      const { data, error } = await query.order('valor_pontuacao', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!modalityId && !!eventId && !!modeloId
  });

  const calculateRankingsMutation = useMutation({
    mutationFn: async () => {
      setIsCalculating(true);
      
      try {
        const results = [];
        
        for (const field of calculatedFields) {
          const { tipo_calculo, contexto, ordem_calculo } = field.metadados || {};
          
          if (tipo_calculo === 'colocacao_bateria' || tipo_calculo === 'colocacao_final') {
            // Sort scores based on ordem_calculo (asc = lower is better, desc = higher is better)
            const sortedScores = [...scores].sort((a, b) => {
              if (ordem_calculo === 'asc') {
                return a.valor_pontuacao - b.valor_pontuacao;
              } else {
                return b.valor_pontuacao - a.valor_pontuacao;
              }
            });

            // Assign rankings
            let currentRank = 1;
            for (let i = 0; i < sortedScores.length; i++) {
              const score = sortedScores[i];
              
              // Handle ties - if same value as previous, keep same rank
              if (i > 0 && sortedScores[i-1].valor_pontuacao === score.valor_pontuacao) {
                // Keep same rank
              } else {
                currentRank = i + 1;
              }

              // Update or create tentativa_pontuacao for calculated field
              const { error: upsertError } = await supabase
                .from('tentativas_pontuacao')
                .upsert({
                  pontuacao_id: score.id,
                  chave_campo: field.chave_campo,
                  valor: currentRank,
                  valor_formatado: `${currentRank}º`
                }, {
                  onConflict: 'pontuacao_id,chave_campo'
                });

              if (upsertError) {
                console.error('Error updating calculated field:', upsertError);
                throw upsertError;
              }

              results.push({
                chave_campo: field.chave_campo,
                athlete_id: score.atleta_id,
                valor_calculado: currentRank
              });
            }
          }
        }

        return results;
      } finally {
        setIsCalculating(false);
      }
    },
    onSuccess: (results) => {
      toast.success('Colocações calculadas com sucesso!');
      onCalculationComplete?.(results);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ 
        queryKey: ['athlete-dynamic-scores', modalityId, eventId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['modality-scores-for-ranking', modalityId, eventId, bateriaId] 
      });
    },
    onError: (error) => {
      console.error('Error calculating rankings:', error);
      toast.error('Erro ao calcular colocações');
    }
  });

  if (calculatedFields.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <Calculator className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhum campo calculado configurado para esta modalidade.</p>
            <p className="text-sm mt-1">Configure campos de colocação no modelo da modalidade.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Campos Calculados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          {calculatedFields.map((field) => (
            <div key={field.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">{field.rotulo_campo}</div>
                <div className="text-sm text-muted-foreground">
                  Tipo: {field.metadados?.tipo_calculo} | 
                  Contexto: {field.metadados?.contexto} | 
                  Ordem: {field.metadados?.ordem_calculo}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            {scores.length} pontuação(ões) encontrada(s) para cálculo
          </div>
          
          <Button
            onClick={() => calculateRankingsMutation.mutate()}
            disabled={isCalculating || calculateRankingsMutation.isPending || scores.length === 0}
            className="w-full"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isCalculating ? 'animate-spin' : ''}`} />
            {isCalculating ? 'Calculando...' : 'Calcular Colocações'}
          </Button>
        </div>

        {scores.length === 0 && (
          <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
            ⚠️ Nenhuma pontuação encontrada. Registre pontuações primeiro antes de calcular colocações.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
