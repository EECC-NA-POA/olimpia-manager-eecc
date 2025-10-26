
import { supabase } from '@/lib/supabase';

interface PontuacaoData {
  eventId: string;
  modalityId: number;
  athleteId: string;
  equipeId?: number | null;
  judgeId: string;
  modeloId: number;
  observacoes?: string | null;
  numeroBateria?: number | null;
}

export async function upsertPontuacao(
  data: PontuacaoData, 
  usesBaterias: boolean
) {
  console.log('=== UPSERT PONTUAÇÃO ===');
  console.log('Data for upsert:', data);
  console.log('Uses baterias:', usesBaterias);
  console.log('Observacoes received:', data.observacoes);

  // Prepare base pontuacao data - colunas 'raia', 'bateria', 'valor_pontuacao' e 'posicao_final' foram removidas
  const pontuacaoData: any = {
    evento_id: data.eventId,
    modalidade_id: data.modalityId,
    atleta_id: data.athleteId,
    equipe_id: data.equipeId || null,
    juiz_id: data.judgeId,
    modelo_id: data.modeloId,
    observacoes: data.observacoes || null,
    data_registro: new Date().toISOString()
  };

  console.log('Final pontuacao data for database:', pontuacaoData);
  console.log('Fields included:', Object.keys(pontuacaoData));

  try {
    // Check for existing record - using only fields that always exist
    const searchFields: {
      evento_id: string;
      modalidade_id: number;
      atleta_id: string;
      juiz_id: string;
      modelo_id: number;
      equipe_id?: number | null;
      numero_bateria?: number | null;
    } = {
      evento_id: data.eventId,
      modalidade_id: data.modalityId,
      atleta_id: data.athleteId,
      juiz_id: data.judgeId,
      modelo_id: data.modeloId
    };

    // Add equipe_id to search if it exists
    if (data.equipeId) {
      searchFields.equipe_id = data.equipeId;
    }

    // Add numero_bateria to search if it exists
    if (data.numeroBateria !== null && data.numeroBateria !== undefined) {
      searchFields.numero_bateria = data.numeroBateria;
    }

    console.log('Searching for existing record with fields:', searchFields);

    const { data: existing, error: searchError } = await supabase
      .from('pontuacoes')
      .select('id')
      .match(searchFields)
      .maybeSingle();

    if (searchError) {
      console.error('Error searching for existing record:', searchError);
      throw searchError;
    }

    if (existing) {
      console.log('Updating existing record with ID:', existing.id);
      
      const { data: updated, error: updateError } = await supabase
        .from('pontuacoes')
        .update(pontuacaoData)
        .eq('id', existing.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating pontuacao:', updateError);
        throw updateError;
      }

      console.log('=== PONTUAÇÃO UPDATED SUCCESSFULLY ===');
      return updated;
    } else {
      console.log('Inserting new record');
      
      const { data: inserted, error: insertError } = await supabase
        .from('pontuacoes')
        .insert(pontuacaoData)
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting pontuacao:', insertError);
        throw insertError;
      }

      console.log('=== PONTUAÇÃO INSERTED SUCCESSFULLY ===');
      return inserted;
    }
  } catch (error) {
    console.error('=== ERROR IN UPSERT PONTUAÇÃO ===');
    console.error('Error details:', error);
    throw error;
  }
}

export async function insertTentativas(tentativas: any[], pontuacaoId: number) {
  if (!tentativas || tentativas.length === 0) {
    console.log('No tentativas to insert');
    return;
  }

  console.log('=== INSERTING TENTATIVAS ===');
  console.log('Tentativas to insert:', tentativas);
  console.log('Pontuacao ID:', pontuacaoId);

  try {
    // Add pontuacao_id to each tentativa
    const tentativasWithId = tentativas.map(tentativa => ({
      ...tentativa,
      pontuacao_id: pontuacaoId
    }));

    const { data, error } = await supabase
      .from('tentativas_pontuacao')
      .insert(tentativasWithId)
      .select();

    if (error) {
      console.error('Error inserting tentativas:', error);
      throw error;
    }

    console.log('=== TENTATIVAS INSERTED SUCCESSFULLY ===');
    console.log('Inserted tentativas:', data);
    return data;
  } catch (error) {
    console.error('=== ERROR INSERTING TENTATIVAS ===');
    console.error('Error details:', error);
    throw error;
  }
}
