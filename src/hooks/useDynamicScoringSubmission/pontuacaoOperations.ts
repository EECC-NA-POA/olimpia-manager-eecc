
import { supabase } from '@/lib/supabase';
import type { DynamicSubmissionData } from './types';

export async function upsertPontuacao(
  data: DynamicSubmissionData,
  valorPontuacao: number
) {
  console.log('=== UPSERT PONTUACAO START ===');
  console.log('Data received:', data);
  console.log('Valor pontuacao:', valorPontuacao);

  // 1. Verificar se já existe pontuação para este atleta
  const { data: existingScore } = await supabase
    .from('pontuacoes')
    .select('id')
    .eq('evento_id', data.eventId)
    .eq('modalidade_id', data.modalityId)
    .eq('atleta_id', data.athleteId)
    .eq('modelo_id', data.modeloId)
    .eq('juiz_id', data.judgeId)
    .eq('numero_bateria', data.bateriaId || null)
    .maybeSingle();

  // Preparar dados completos da pontuação
  const pontuacaoData = {
    evento_id: data.eventId,
    modalidade_id: data.modalityId,
    atleta_id: data.athleteId,
    equipe_id: data.equipeId || null,
    juiz_id: data.judgeId,
    modelo_id: data.modeloId,
    valor_pontuacao: valorPontuacao,
    unidade: 'dinâmica',
    observacoes: data.notes || null,
    data_registro: new Date().toISOString(),
    raia: data.raia || null,
    numero_bateria: data.bateriaId || null
  };

  console.log('Pontuacao data to save:', pontuacaoData);

  if (existingScore) {
    // Atualizar pontuação existente
    console.log('=== ATUALIZANDO PONTUAÇÃO EXISTENTE ===');
    const { data: updatedScore, error: updateError } = await supabase
      .from('pontuacoes')
      .update(pontuacaoData)
      .eq('id', existingScore.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating pontuacao:', updateError);
      throw updateError;
    }

    // Remover tentativas antigas
    await supabase
      .from('tentativas_pontuacao')
      .delete()
      .eq('pontuacao_id', existingScore.id);

    console.log('Updated pontuacao:', updatedScore);
    return updatedScore;
  } else {
    // Criar nova pontuação
    console.log('=== CRIANDO NOVA PONTUAÇÃO ===');
    const { data: newScore, error: pontuacaoError } = await supabase
      .from('pontuacoes')
      .insert([pontuacaoData])
      .select()
      .single();

    if (pontuacaoError) {
      console.error('Error creating pontuacao:', pontuacaoError);
      throw pontuacaoError;
    }

    console.log('Created pontuacao:', newScore);
    return newScore;
  }
}

export async function insertTentativas(tentativas: any[]) {
  if (tentativas.length > 0) {
    console.log('=== INSERINDO TENTATIVAS ===');
    console.log('Tentativas to insert:', tentativas);
    
    const { error: tentativasError } = await supabase
      .from('tentativas_pontuacao')
      .insert(tentativas);

    if (tentativasError) {
      console.error('Error creating tentativas:', tentativasError);
      throw tentativasError;
    }

    console.log('=== TENTATIVAS CRIADAS COM SUCESSO ===');
  }
}
