
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, RefreshCw, Info, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

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
  const { data: calculatedFields = [], isLoading: isLoadingFields } = useQuery({
    queryKey: ['calculated-fields', modeloId],
    queryFn: async () => {
      console.log('Fetching calculated fields for model:', modeloId);
      const { data, error } = await supabase
        .from('campos_modelo')
        .select('*')
        .eq('modelo_id', modeloId)
        .eq('tipo_input', 'calculated')
        .order('ordem_exibicao');

      if (error) {
        console.error('Error fetching calculated fields:', error);
        throw error;
      }
      
      console.log('Calculated fields found:', data);
      return data;
    },
    enabled: !!modeloId
  });

  // Fetch current scores for ranking calculation
  const { data: scores = [], isLoading: isLoadingScores } = useQuery({
    queryKey: ['modality-scores-for-ranking', modalityId, eventId, bateriaId],
    queryFn: async () => {
      console.log('Fetching scores for ranking calculation:', { modalityId, eventId, bateriaId });
      
      let query = supabase
        .from('pontuacoes')
        .select(`
          *,
          usuarios!pontuacoes_atleta_id_fkey(nome_completo),
          tentativas_pontuacao(
            chave_campo,
            valor,
            valor_formatado
          )
        `)
        .eq('modalidade_id', modalityId)
        .eq('evento_id', eventId)
        .eq('modelo_id', modeloId);

      if (bateriaId) {
        query = query.eq('numero_bateria', bateriaId);
      }

      const { data, error } = await query.order('valor_pontuacao', { ascending: false });

      if (error) {
        console.error('Error fetching scores for ranking:', error);
        throw error;
      }
      
      console.log('Scores found for ranking:', data);
      return data;
    },
    enabled: !!modalityId && !!eventId && !!modeloId
  });

  const calculateRankingsMutation = useMutation({
    mutationFn: async () => {
      setIsCalculating(true);
      console.log('Starting ranking calculation...');
      
      try {
        const results = [];
        
        for (const field of calculatedFields) {
          console.log('Processing calculated field:', field);
          
          const { tipo_calculo, ordem_calculo, campo_referencia } = field.metadados || {};
          
          if (tipo_calculo === 'colocacao_bateria' || tipo_calculo === 'colocacao_final') {
            if (!campo_referencia) {
              console.warn('Campo de referência não definido para:', field.chave_campo);
              continue;
            }

            // Get scores with reference field values
            const scoresWithReference = scores
              .map(score => {
                const tentativa = score.tentativas_pontuacao?.find(
                  (t: any) => t.chave_campo === campo_referencia
                );
                
                if (!tentativa) return null;

                return {
                  score_id: score.id,
                  atleta_id: score.atleta_id,
                  atleta_nome: score.usuarios?.nome_completo || 'Atleta',
                  valor: tentativa.valor,
                  valor_formatado: tentativa.valor_formatado
                };
              })
              .filter(item => item !== null);

            console.log('Scores with reference field:', scoresWithReference);

            if (scoresWithReference.length === 0) {
              console.warn('Nenhum score encontrado com campo de referência:', campo_referencia);
              continue;
            }

            // Sort based on calculation order
            const sortedScores = [...scoresWithReference].sort((a, b) => {
              if (ordem_calculo === 'asc') {
                return a.valor - b.valor; // Lower value = better position
              } else {
                return b.valor - a.valor; // Higher value = better position
              }
            });

            console.log('Sorted scores:', sortedScores);

            // Calculate placements (considering ties)
            let currentPosition = 1;
            let previousValue: number | null = null;

            for (let i = 0; i < sortedScores.length; i++) {
              const score = sortedScores[i];
              
              if (previousValue === null || score.valor !== previousValue) {
                currentPosition = i + 1;
              }

              // Update or create tentativa_pontuacao for calculated field
              const { error: upsertError } = await supabase
                .from('tentativas_pontuacao')
                .upsert({
                  pontuacao_id: score.score_id,
                  chave_campo: field.chave_campo,
                  valor: currentPosition,
                  valor_formatado: `${currentPosition}º`
                }, {
                  onConflict: 'pontuacao_id,chave_campo'
                });

              if (upsertError) {
                console.error('Error updating calculated field:', upsertError);
                throw upsertError;
              }

              results.push({
                chave_campo: field.chave_campo,
                atleta_id: score.atleta_id,
                atleta_nome: score.atleta_nome,
                valor_calculado: currentPosition,
                posicao: `${currentPosition}º`
              });
              
              previousValue = score.valor;
            }
          }
        }

        console.log('Calculation results:', results);
        return results;
      } finally {
        setIsCalculating(false);
      }
    },
    onSuccess: (results) => {
      console.log('Calculation completed successfully:', results);
      toast.success(`Colocações calculadas com sucesso! ${results.length} registros atualizados.`);
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

  if (isLoadingFields || isLoadingScores) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <Calculator className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Carregando campos calculados...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
          Gerenciar Colocações
          <Badge variant="outline">{calculatedFields.length} campo(s)</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {calculatedFields.map((field) => (
            <div key={field.id} className="p-3 border rounded-lg bg-blue-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium text-blue-900">{field.rotulo_campo}</div>
                  <div className="text-sm text-blue-700 mt-1">
                    <div>Tipo: {field.metadados?.tipo_calculo}</div>
                    <div>Campo de referência: {field.metadados?.campo_referencia || 'Não definido'}</div>
                    <div>Ordem: {field.metadados?.ordem_calculo || 'asc'}</div>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Calculado
                </Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            <span>{scores.length} pontuação(ões) encontrada(s) para cálculo</span>
          </div>
          
          {scores.length === 0 && (
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span>Nenhuma pontuação encontrada. Registre pontuações primeiro antes de calcular colocações.</span>
            </div>
          )}

          <Button
            onClick={() => calculateRankingsMutation.mutate()}
            disabled={isCalculating || calculateRankingsMutation.isPending || scores.length === 0}
            className="w-full"
            size="lg"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isCalculating ? 'animate-spin' : ''}`} />
            {isCalculating ? 'Calculando Colocações...' : 'Calcular Colocações'}
          </Button>
        </div>

        {calculateRankingsMutation.isError && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            Erro ao calcular colocações. Verifique os logs do console para mais detalhes.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
