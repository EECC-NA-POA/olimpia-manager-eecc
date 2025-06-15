
import { supabase } from '@/lib/supabase';

export async function upsertPontuacao(data: any, valorPontuacao: number) {
  console.log('=== UPSERT PONTUAÇÃO ===');
  console.log('Data for upsert:', data);
  console.log('Valor pontuacao:', valorPontuacao);
  console.log('Observacoes received in upsertPontuacao:', data.observacoes);
  console.log('Numero bateria received:', data.numero_bateria);

  // CRITICAL: Ensure NO bateria_id is ever included - only allow expected fields
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

  console.log('Final pontuacao data for database (GUARANTEED NO bateria_id):', pontuacaoData);

  // Build the search query with proper NULL handling
  let searchQuery = supabase
    .from('pontuacoes')
    .select('id')
    .eq('atleta_id', pontuacaoData.atleta_id)
    .eq('modalidade_id', pontuacaoData.modalidade_id)
    .eq('evento_id', pontuacaoData.evento_id)
    .eq('juiz_id', pontuacaoData.juiz_id)
    .eq('modelo_id', pontuacaoData.modelo_id);

  // Handle numero_bateria correctly - use is() for NULL values
  if (pontuacaoData.numero_bateria === null) {
    searchQuery = searchQuery.is('numero_bateria', null);
  } else {
    searchQuery = searchQuery.eq('numero_bateria', pontuacaoData.numero_bateria);
  }

  const { data: existingRecords, error: findError } = await searchQuery;

  if (findError) {
    console.error('Error searching for existing record:', findError);
    throw findError;
  }

  let result;
  
  if (existingRecords && existingRecords.length > 0) {
    // Atualizar registro existente
    const existingId = existingRecords[0].id;
    console.log('Updating existing record with ID:', existingId);
    
    const { data: updatedRecord, error } = await supabase
      .from('pontuacoes')
      .update(pontuacaoData)
      .eq('id', existingId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating pontuacao:', error);
      throw error;
    }
    result = updatedRecord;
  } else {
    // Inserir novo registro
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
