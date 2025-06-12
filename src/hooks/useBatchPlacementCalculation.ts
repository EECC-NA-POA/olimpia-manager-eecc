import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { CampoModelo } from '@/types/dynamicScoring';
import { parseTimeToMilliseconds, isTimeValue } from '@/utils/dynamicScoringUtils';

interface AthleteScore {
  athleteId: string;
  athleteName: string;
  score: number;
  originalValue: string;
  placement?: number;
}

interface UseBatchPlacementCalculationProps {
  modalityId: number;
  eventId: string;
  judgeId: string;
  modeloId: number;
  bateriaId?: number;
}

export function useBatchPlacementCalculation({
  modalityId,
  eventId,
  judgeId,
  modeloId,
  bateriaId
}: UseBatchPlacementCalculationProps) {
  const [isCalculating, setIsCalculating] = useState(false);
  const queryClient = useQueryClient();

  const calculateBatchPlacements = async (
    calculatedField: CampoModelo, 
    athleteScores: Record<string, any>
  ) => {
    setIsCalculating(true);
    
    try {
      console.log('Iniciando cálculo de colocações para campo:', calculatedField.chave_campo);
      console.log('Dados dos atletas recebidos:', athleteScores);
      
      // Obter o campo de referência configurado ou detectar automaticamente
      let referenceField = calculatedField.metadados?.campo_referencia;
      console.log('Campo de referência configurado:', referenceField);
      
      // Se não há campo de referência configurado ou o campo configurado não existe nos dados,
      // tentar encontrar um campo válido
      const firstAthleteData = Object.values(athleteScores)[0] || {};
      const availableFields = Object.keys(firstAthleteData).filter(key => 
        key !== 'athleteName' && 
        key !== 'athleteId' && 
        firstAthleteData[key] !== '' && 
        firstAthleteData[key] !== null && 
        firstAthleteData[key] !== undefined
      );
      
      console.log('Campos disponíveis nos dados:', availableFields);
      
      // Verificar se o campo de referência configurado realmente existe nos dados
      if (referenceField && !availableFields.includes(referenceField)) {
        console.warn(`Campo de referência configurado "${referenceField}" não encontrado nos dados. Tentando detectar automaticamente.`);
        referenceField = null; // Forçar detecção automática
      }
      
      // Detectar automaticamente se necessário
      if (!referenceField) {
        console.log('Realizando detecção automática do campo de referência...');
        
        // Filtrar campos válidos que contêm valores numéricos ou de tempo
        const validFields = availableFields.filter(key => {
          const value = firstAthleteData[key];
          console.log(`Verificando campo ${key} com valor:`, value, 'tipo:', typeof value);
          
          // Verificar se é um valor numérico ou de tempo
          if (typeof value === 'string' && isTimeValue(value)) return true;
          if (!isNaN(parseFloat(String(value))) && parseFloat(String(value)) > 0) return true;
          
          return false;
        });
        
        console.log('Campos válidos disponíveis para cálculo:', validFields);
        
        if (validFields.length > 0) {
          // Lista ordenada de campos prioritários para pontuações
          const priorityFields = ['resultado', 'tempo', 'time', 'distancia', 'distance', 'pontos', 'score', 'points'];
          
          // Tentar encontrar um campo prioritário primeiro
          for (const priority of priorityFields) {
            const match = validFields.find(field => 
              field.toLowerCase() === priority || 
              field.toLowerCase().includes(priority)
            );
            
            if (match) {
              referenceField = match;
              console.log(`Campo prioritário encontrado: ${referenceField}`);
              break;
            }
          }
          
          // Se não encontrou campo prioritário, usar o primeiro campo válido
          if (!referenceField) {
            referenceField = validFields[0];
            console.log(`Nenhum campo prioritário encontrado. Usando primeiro campo válido: ${referenceField}`);
          }
        }
      }
      
      if (!referenceField) {
        throw new Error('Nenhum campo de referência disponível para cálculo de colocação. Configure um campo de referência no campo calculado ou insira pontuações válidas.');
      }

      // Extrair e processar pontuações dos atletas
      const scores: AthleteScore[] = [];
      
      for (const [athleteId, data] of Object.entries(athleteScores)) {
        if (!data || typeof data !== 'object') {
          console.log(`Dados inválidos para atleta ${athleteId}`);
          continue;
        }
        
        const rawValue = data[referenceField];
        const athleteName = data.athleteName || athleteId;
        
        console.log(`Processando atleta ${athleteName}:`);
        console.log(`  Campo: ${referenceField}`);
        console.log(`  Valor bruto:`, rawValue);
        console.log(`  Tipo do valor:`, typeof rawValue);
        
        if (rawValue === '' || rawValue === null || rawValue === undefined) {
          console.log(`  Pulando atleta - valor vazio`);
          continue;
        }
        
        let numericScore = 0;
        let originalValue = String(rawValue || '');
        
        // Processar diferentes tipos de valores
        if (typeof rawValue === 'string') {
          // Verificar se é um tempo formatado
          if (isTimeValue(rawValue)) {
            numericScore = parseTimeToMilliseconds(rawValue);
            console.log(`  Tempo convertido: ${rawValue} -> ${numericScore}ms`);
          } else {
            // Tentar converter string para número
            const cleanValue = rawValue.replace(/[^\d.,]/g, '').replace(',', '.');
            numericScore = parseFloat(cleanValue) || 0;
            console.log(`  String convertida: ${rawValue} -> ${numericScore}`);
          }
        } else if (typeof rawValue === 'number') {
          numericScore = rawValue;
          console.log(`  Número direto: ${numericScore}`);
        }
        
        if (numericScore > 0) {
          scores.push({
            athleteId,
            athleteName,
            score: numericScore,
            originalValue
          });
          console.log(`  ✓ Adicionado: ${numericScore}`);
        } else {
          console.log(`  ✗ Valor inválido: ${numericScore}`);
        }
      }

      console.log('Pontuações válidas encontradas:', scores.length);

      if (scores.length === 0) {
        throw new Error(`Nenhuma pontuação válida encontrada no campo "${referenceField}". Insira pontuações válidas (números ou tempos no formato MM:SS.mmm) para calcular colocações.`);
      }

      // Ordenar baseado no tipo de ordenação configurado
      const ordem = calculatedField.metadados?.ordem_calculo || 'desc';
      console.log('Ordem de cálculo configurada:', ordem);
      
      // Para tempos, geralmente queremos ordem crescente (menor tempo = melhor)
      // Para pontos, geralmente queremos ordem decrescente (maior pontos = melhor)
      const isTimeField = scores.some(s => isTimeValue(s.originalValue));
      const effectiveOrder = isTimeField ? 'asc' : ordem;
      
      console.log('Ordem efetiva (considerando se é tempo):', effectiveOrder);
      
      scores.sort((a, b) => {
        if (effectiveOrder === 'asc') {
          return a.score - b.score; // Menor valor = melhor colocação
        } else {
          return b.score - a.score; // Maior valor = melhor colocação
        }
      });

      console.log('Pontuações ordenadas:');
      scores.forEach((s, i) => console.log(`${i + 1}. ${s.athleteName}: ${s.originalValue} (${s.score})`));

      // Atribuir colocações (tratando empates)
      let currentPlacement = 1;
      for (let i = 0; i < scores.length; i++) {
        if (i > 0 && scores[i].score !== scores[i - 1].score) {
          currentPlacement = i + 1;
        }
        scores[i].placement = currentPlacement;
        console.log(`${scores[i].athleteName}: ${scores[i].originalValue} = ${currentPlacement}º lugar`);
      }

      // Salvar colocações no banco de dados em lote
      console.log('Salvando colocações no banco de dados...');
      const placementPromises = scores.map(athlete => 
        saveCalculatedPlacement({
          athleteId: athlete.athleteId,
          fieldKey: calculatedField.chave_campo,
          placement: athlete.placement!,
          bateriaId
        })
      );

      await Promise.all(placementPromises);

      // Invalidar queries para recarregar dados
      queryClient.invalidateQueries({
        queryKey: ['athlete-dynamic-scores', modalityId, eventId, modeloId, bateriaId]
      });

      toast.success(`Colocações calculadas para ${scores.length} atletas com base no campo "${referenceField}"`);
      
    } catch (error) {
      console.error('Erro ao calcular colocações:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao calcular colocações');
    } finally {
      setIsCalculating(false);
    }
  };

  const saveCalculatedPlacement = async ({
    athleteId,
    fieldKey,
    placement,
    bateriaId
  }: {
    athleteId: string;
    fieldKey: string;
    placement: number;
    bateriaId?: number;
  }) => {
    console.log(`Salvando colocação para atleta ${athleteId}: ${fieldKey} = ${placement}`);
    
    // Buscar pontuação existente
    let query = supabase
      .from('pontuacoes')
      .select('id')
      .eq('atleta_id', athleteId)
      .eq('modalidade_id', modalityId)
      .eq('evento_id', eventId)
      .eq('modelo_id', modeloId)
      .eq('juiz_id', judgeId);

    if (bateriaId) {
      query = query.eq('numero_bateria', bateriaId);
    } else {
      query = query.is('numero_bateria', null);
    }

    const { data: existingScore, error: scoreError } = await query.single();

    if (scoreError && scoreError.code !== 'PGRST116') {
      throw scoreError;
    }

    let pontuacaoId: number;

    if (existingScore) {
      pontuacaoId = existingScore.id;
    } else {
      // Criar nova pontuação se não existir
      const { data: newScore, error: newScoreError } = await supabase
        .from('pontuacoes')
        .insert({
          atleta_id: athleteId,
          modalidade_id: modalityId,
          evento_id: eventId,
          modelo_id: modeloId,
          juiz_id: judgeId,
          numero_bateria: bateriaId || null
        })
        .select('id')
        .single();

      if (newScoreError) throw newScoreError;
      pontuacaoId = newScore.id;
    }

    // Salvar/atualizar tentativa calculada
    const { error: tentativaError } = await supabase
      .from('tentativas_pontuacao')
      .upsert({
        pontuacao_id: pontuacaoId,
        chave_campo: fieldKey,
        valor: placement,
        valor_formatado: placement.toString(),
        calculado: true
      }, {
        onConflict: 'pontuacao_id,chave_campo'
      });

    if (tentativaError) throw tentativaError;
  };

  return {
    isCalculating,
    calculateBatchPlacements
  };
}
