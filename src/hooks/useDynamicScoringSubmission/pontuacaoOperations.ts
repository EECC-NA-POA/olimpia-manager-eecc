
import { supabase } from '@/lib/supabase';

export async function upsertPontuacao(data: any, valorPontuacao: number, usesBaterias: boolean = false) {
  console.log('=== UPSERT PONTUAÇÃO ===');
  console.log('Data for upsert:', data);
  console.log('Valor pontuacao:', valorPontuacao);
  console.log('Uses baterias:', usesBaterias);
  console.log('Observacoes received:', data.observacoes);
  
  // Build pontuacao data with ONLY valid database fields
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
    raia: data.raia || null
  };

  // APENAS incluir numero_bateria se a modalidade usa baterias E o valor está presente
  if (usesBaterias && data.numeroBateria !== undefined && data.numeroBateria !== null) {
    pontuacaoData.numero_bateria = data.numeroBateria;
    console.log('Modalidade usa baterias - incluindo numero_bateria:', data.numeroBateria);
  } else {
    console.log('Modalidade NÃO usa baterias OU numero_bateria não fornecido - campo omitido');
  }

  console.log('Final pontuacao data for database:', pontuacaoData);
  console.log('Fields included:', Object.keys(pontuacaoData));

  // Build search query - NUNCA incluir numero_bateria se a modalidade não usa baterias
  let searchQuery = supabase
    .from('pontuacoes')
    .select('id')
    .eq('atleta_id', pontuacaoData.atleta_id)
    .eq('modalidade_id', pontuacaoData.modalidade_id)
    .eq('evento_id', pontuacaoData.evento_id)
    .eq('juiz_id', pontuacaoData.juiz_id)
    .eq('modelo_id', pontuacaoData.modelo_id);

  // Handle equipe_id correctly
  if (pontuacaoData.equipe_id === null) {
    searchQuery = searchQuery.is('equipe_id', null);
  } else {
    searchQuery = searchQuery.eq('equipe_id', pontuacaoData.equipe_id);
  }

  // APENAS adicionar numero_bateria à consulta se a modalidade usa baterias
  if (usesBaterias && 'numero_bateria' in pontuacaoData) {
    if (pontuacaoData.numero_bateria === null || pontuacaoData.numero_bateria === undefined) {
      searchQuery = searchQuery.is('numero_bateria', null);
    } else {
      searchQuery = searchQuery.eq('numero_bateria', pontuacaoData.numero_bateria);
    }
    console.log('Incluindo numero_bateria na consulta para modalidade com baterias');
  } else {
    console.log('NÃO incluindo numero_bateria na consulta - modalidade sem baterias');
  }

  const { data: existingRecords, error: findError } = await searchQuery;

  if (findError) {
    console.error('Error searching for existing record:', findError);
    throw findError;
  }

  let result;
  
  if (existingRecords && existingRecords.length > 0) {
    // Update existing record
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
