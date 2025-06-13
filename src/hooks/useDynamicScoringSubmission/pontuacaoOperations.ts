
import { supabase } from '@/lib/supabase';

export async function upsertPontuacao(data: any, valorPontuacao: number) {
  console.log('=== UPSERT PONTUAÇÃO ===');
  console.log('Data for upsert:', data);
  console.log('Valor pontuacao:', valorPontuacao);
  console.log('Observacoes to save:', data.observacoes);

  const pontuacaoData = {
    evento_id: data.eventId,
    modalidade_id: data.modalityId,
    atleta_id: data.athleteId,
    equipe_id: data.equipeId || null,
    juiz_id: data.judgeId,
    modelo_id: data.modeloId,
    valor_pontuacao: valorPontuacao,
    unidade: 'pontos', // Default for dynamic scoring
    observacoes: data.observacoes || null, // Ensure observacoes is included
    data_registro: new Date().toISOString(),
    bateria_id: data.bateriaId || null,
    numero_raia: data.raia || null
  };

  console.log('Final pontuacao data for database:', pontuacaoData);

  const { data: pontuacao, error } = await supabase
    .from('pontuacoes')
    .upsert(pontuacaoData, {
      onConflict: 'atleta_id,modalidade_id,evento_id,juiz_id,modelo_id,bateria_id',
      ignoreDuplicates: false
    })
    .select()
    .single();

  if (error) {
    console.error('Error upserting pontuacao:', error);
    throw error;
  }

  console.log('Pontuacao upserted successfully:', pontuacao);
  return pontuacao;
}

export async function insertTentativas(tentativas: any[], pontuacaoId: string) {
  if (tentativas.length === 0) {
    console.log('No tentativas to insert');
    return;
  }

  console.log('=== INSERINDO TENTATIVAS ===');
  console.log('Tentativas to insert:', tentativas);

  // Delete existing tentativas for this pontuacao
  const { error: deleteError } = await supabase
    .from('tentativas')
    .delete()
    .eq('pontuacao_id', pontuacaoId);

  if (deleteError) {
    console.error('Error deleting existing tentativas:', deleteError);
    throw deleteError;
  }

  // Insert new tentativas
  const { data, error } = await supabase
    .from('tentativas')
    .insert(tentativas)
    .select();

  if (error) {
    console.error('Error inserting tentativas:', error);
    throw error;
  }

  console.log('Tentativas inserted successfully:', data);
  return data;
}
