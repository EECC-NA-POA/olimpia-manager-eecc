
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
    numero_bateria: data.bateriaId || null,
    posicao_final: null // Will be calculated later by ranking system
  };

  console.log('Pontuacao data to upsert:', pontuacaoData);

  // First, check if there's an existing score for this athlete, modality, event, judge, and modelo
  const { data: existingScore, error: fetchError } = await supabase
    .from('pontuacoes')
    .select('id')
    .eq('atleta_id', data.athleteId)
    .eq('modalidade_id', data.modalityId)
    .eq('evento_id', data.eventId)
    .eq('juiz_id', data.judgeId)
    .eq('modelo_id', data.modeloId)
    .eq('numero_bateria', data.bateriaId || null)
    .maybeSingle();

  if (fetchError) {
    console.error('Error checking for existing score:', fetchError);
    throw fetchError;
  }

  let upsertedScore;

  if (existingScore) {
    // Update existing score
    console.log('Updating existing pontuacao with id:', existingScore.id);
    const { data: updatedScore, error: updateError } = await supabase
      .from('pontuacoes')
      .update({
        valor_pontuacao: valorPontuacao,
        unidade: 'dinâmica',
        observacoes: data.notes || null,
        data_registro: new Date().toISOString(),
        raia: data.raia || null,
        posicao_final: null // Reset position when score is updated
      })
      .eq('id', existingScore.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating pontuacao:', updateError);
      throw updateError;
    }

    upsertedScore = updatedScore;
    console.log('Updated existing pontuacao:', upsertedScore);
  } else {
    // Insert new score
    console.log('Creating new pontuacao');
    const { data: insertedScore, error: insertError } = await supabase
      .from('pontuacoes')
      .insert([pontuacaoData])
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting pontuacao:', insertError);
      throw insertError;
    }

    upsertedScore = insertedScore;
    console.log('Inserted new pontuacao:', upsertedScore);
  }

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
