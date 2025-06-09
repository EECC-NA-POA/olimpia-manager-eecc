
import { supabase } from '@/lib/supabase';
import type { DynamicSubmissionData } from './types';

export async function upsertPontuacao(
  data: DynamicSubmissionData,
  valorPontuacao: number
) {
  // 1. Verificar se já existe pontuação para este atleta
  const { data: existingScore } = await supabase
    .from('pontuacoes')
    .select('id')
    .eq('evento_id', data.eventId)
    .eq('modalidade_id', data.modalityId)
    .eq('atleta_id', data.athleteId)
    .eq('modelo_id', data.modeloId)
    .eq('juiz_id', data.judgeId)
    .maybeSingle();

  if (existingScore) {
    // Atualizar pontuação existente
    console.log('=== ATUALIZANDO PONTUAÇÃO EXISTENTE ===');
    const { data: updatedScore, error: updateError } = await supabase
      .from('pontuacoes')
      .update({
        valor_pontuacao: valorPontuacao,
        observacoes: data.notes || null,
        data_registro: new Date().toISOString(),
        raia: data.raia || null,
        numero_bateria: data.bateriaId || null
      })
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

    return updatedScore;
  } else {
    // Criar nova pontuação
    console.log('=== CRIANDO NOVA PONTUAÇÃO ===');
    const pontuacaoData = {
      evento_id: data.eventId,
      modalidade_id: data.modalityId,
      atleta_id: data.athleteId,
      equipe_id: data.equipeId || null,
      juiz_id: data.judgeId,
      modelo_id: data.modeloId,
      valor_pontuacao: valorPontuacao,
      observacoes: data.notes || null,
      data_registro: new Date().toISOString(),
      unidade: 'dinâmica',
      raia: data.raia || null,
      numero_bateria: data.bateriaId || null
    };

    const { data: newScore, error: pontuacaoError } = await supabase
      .from('pontuacoes')
      .insert([pontuacaoData])
      .select()
      .single();

    if (pontuacaoError) {
      console.error('Error creating pontuacao:', pontuacaoError);
      throw pontuacaoError;
    }

    return newScore;
  }
}

export async function insertTentativas(tentativas: any[]) {
  if (tentativas.length > 0) {
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
