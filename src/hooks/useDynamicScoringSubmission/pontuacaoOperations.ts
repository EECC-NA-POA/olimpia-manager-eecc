
import { supabase } from '@/lib/supabase';
import type { DynamicSubmissionData } from './types';

export async function upsertPontuacao(
  data: DynamicSubmissionData,
  valorPontuacao: number
) {
  console.log('=== UPSERT PONTUACAO START ===');
  console.log('Data received:', data);
  console.log('Valor pontuacao:', valorPontuacao);

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

  console.log('Pontuacao data to upsert:', pontuacaoData);

  // Use upsert com a constraint única para evitar duplicatas
  const { data: upsertedScore, error: upsertError } = await supabase
    .from('pontuacoes')
    .upsert(pontuacaoData, {
      onConflict: 'atleta_id,modalidade_id,evento_id,juiz_id,modelo_id,numero_bateria',
      ignoreDuplicates: false
    })
    .select()
    .single();

  if (upsertError) {
    console.error('Error upserting pontuacao:', upsertError);
    throw upsertError;
  }

  console.log('Upserted pontuacao:', upsertedScore);
  return upsertedScore;
}

export async function insertTentativas(tentativas: any[], pontuacaoId: number) {
  if (tentativas.length > 0) {
    console.log('=== INSERINDO/ATUALIZANDO TENTATIVAS ===');
    console.log('Tentativas to insert:', tentativas);
    
    // First, delete existing tentativas for this pontuacao_id
    const { error: deleteError } = await supabase
      .from('tentativas_pontuacao')
      .delete()
      .eq('pontuacao_id', pontuacaoId);

    if (deleteError) {
      console.error('Error deleting existing tentativas:', deleteError);
      throw deleteError;
    }

    // Then insert new tentativas
    const { error: insertError } = await supabase
      .from('tentativas_pontuacao')
      .insert(tentativas);

    if (insertError) {
      console.error('Error inserting tentativas:', insertError);
      throw insertError;
    }

    console.log('=== TENTATIVAS CRIADAS COM SUCESSO ===');
  }
}
