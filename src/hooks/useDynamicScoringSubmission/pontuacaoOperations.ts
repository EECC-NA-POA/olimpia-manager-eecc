
import { supabase } from '@/lib/supabase';

export async function upsertPontuacao(data: any, valorPontuacao: number) {
  console.log('=== UPSERT PONTUAÇÃO ===');
  console.log('Data for upsert:', data);
  console.log('Valor pontuacao:', valorPontuacao);
  console.log('Observacoes received in upsertPontuacao:', data.observacoes);
  console.log('Numero bateria received:', data.numero_bateria);

  const pontuacaoData = {
    evento_id: data.eventId,
    modalidade_id: data.modalityId,
    atleta_id: data.athleteId,
    equipe_id: data.equipeId || null,
    juiz_id: data.judgeId,
    modelo_id: data.modeloId,
    valor_pontuacao: valorPontuacao,
    unidade: 'pontos',
    observacoes: data.observacoes || null,
    data_registro: new Date().toISOString(),
    numero_bateria: data.numero_bateria || null,
    raia: data.raia || null
  };

  console.log('Final pontuacao data for database:', pontuacaoData);

  // Build the query step by step to handle null values properly
  let query = supabase
    .from('pontuacoes')
    .select('id')
    .eq('atleta_id', pontuacaoData.atleta_id)
    .eq('modalidade_id', pontuacaoData.modalidade_id)
    .eq('evento_id', pontuacaoData.evento_id)
    .eq('juiz_id', pontuacaoData.juiz_id)
    .eq('modelo_id', pontuacaoData.modelo_id);

  // Handle numero_bateria null/not null cases properly
  if (pontuacaoData.numero_bateria === null) {
    query = query.is('numero_bateria', null);
  } else {
    query = query.eq('numero_bateria', pontuacaoData.numero_bateria);
  }

  const { data: existingRecord, error: findError } = await query.single();

  if (findError && findError.code !== 'PGRST116') {
    console.error('Error searching for existing record:', findError);
    // Continue with insert if search fails
  }

  let result;
  
  if (existingRecord && !findError) {
    // Update existing record
    console.log('Updating existing record with ID:', existingRecord.id);
    const { data: updatedRecord, error } = await supabase
      .from('pontuacoes')
      .update(pontuacaoData)
      .eq('id', existingRecord.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating pontuacao:', error);
      throw error;
    }
    result = updatedRecord;
  } else {
    // Insert new record
    console.log('Inserting new record');
    const { data: newRecord, error } = await supabase
      .from('pontuacoes')
      .insert(pontuacaoData)
      .select()
      .single();
    
    if (error) {
      console.error('Error inserting pontuacao:', error);
      throw error;
    }
    result = newRecord;
  }

  console.log('Pontuacao saved successfully:', result);
  return result;
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
    .from('tentativas_pontuacao')
    .delete()
    .eq('pontuacao_id', pontuacaoId);

  if (deleteError) {
    console.error('Error deleting existing tentativas:', deleteError);
    throw deleteError;
  }

  // Insert new tentativas
  const { data, error } = await supabase
    .from('tentativas_pontuacao')
    .insert(tentativas)
    .select();

  if (error) {
    console.error('Error inserting tentativas:', error);
    throw error;
  }

  console.log('Tentativas inserted successfully:', data);
  return data;
}
