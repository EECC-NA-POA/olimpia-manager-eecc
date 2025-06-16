
import { supabase } from '@/lib/supabase';

interface PontuacaoData {
  eventId: string;
  modalityId: number;
  athleteId: string;
  equipeId?: number | null;
  judgeId: string;
  modeloId: number;
  raia?: number | null;
  observacoes?: string | null;
}

export async function upsertPontuacao(
  data: PontuacaoData, 
  valorPontuacao: number, 
  usesBaterias: boolean
) {
  console.log('=== UPSERT PONTUAÇÃO ===');
  console.log('Data for upsert:', data);
  console.log('Valor pontuacao:', valorPontuacao);
  console.log('Uses baterias:', usesBaterias);
  console.log('Observacoes received:', data.observacoes);

  console.log('CRITICAL: pontuacao data will NEVER include battery fields for non-battery modalities');

  // Prepare base pontuacao data - NEVER include bateria_id or numero_bateria for non-battery modalities
  const pontuacaoData: any = {
    evento_id: data.eventId,
    modalidade_id: data.modalityId,
    atleta_id: data.athleteId,
    equipe_id: data.equipeId || null,
    juiz_id: data.judgeId,
    modelo_id: data.modeloId,
    valor_pontuacao: valorPontuacao,
    unidade: 'pontos',
    observacoes: data.observacoes || null,
    data_registro: new Date().toISOString()
  };

  // Only add raia if it exists and is not null
  if (data.raia !== null && data.raia !== undefined) {
    pontuacaoData.raia = data.raia;
  }

  // CRITICAL: Only add bateria-related fields if the modality actually uses baterias
  // For team modalities without baterias, we NEVER include these fields
  if (usesBaterias) {
    console.log('Adding bateria fields because modality uses baterias');
    pontuacaoData.numero_bateria = 1; // Default bateria for modalities that use them
  } else {
    console.log('SKIPPING bateria fields because modality does NOT use baterias');
  }

  console.log('Final pontuacao data for database (GUARANTEED NO BATTERY FIELDS):', pontuacaoData);
  console.log('Fields included:', Object.keys(pontuacaoData));
  console.log('Search query constructed WITHOUT any battery field references');

  try {
    // Check for existing record - using only fields that always exist
    const searchFields = {
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
      console.log('Inserting new record WITHOUT any battery field references');
      
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
