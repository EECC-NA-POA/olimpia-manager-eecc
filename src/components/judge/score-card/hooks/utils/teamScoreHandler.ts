
import { supabase } from '@/lib/supabase';
import { ScoreRecordData, SaveScoreResult } from './types';

export async function handleTeamScore(
  recordData: ScoreRecordData, 
  eventId: string, 
  modalityIdInt: number, 
  teamId: number | null
): Promise<SaveScoreResult> {
  const { numero_bateria } = recordData;
  console.log('Starting team score handling for team:', teamId, 'bateria:', numero_bateria);
  
  if (!teamId) {
    throw new Error('ID da equipe não encontrado para modalidade coletiva');
  }
  
  // Get all team members
  const { data: teamMembers, error: teamMembersError } = await supabase
    .from('inscricoes_modalidades')
    .select('atleta_id')
    .eq('modalidade_id', modalityIdInt)
    .eq('evento_id', eventId)
    .eq('equipe_id', teamId);
  
  if (teamMembersError) {
    console.error('Error fetching team members:', teamMembersError);
    throw new Error('Erro ao buscar membros da equipe');
  }
  
  console.log('Team members found:', teamMembers?.length || 0);
  
  if (!teamMembers || teamMembers.length === 0) {
    throw new Error('Nenhum membro da equipe encontrado');
  }
  
  // Check for existing records for this specific bateria and team members
  const { data: existingRecords, error: existingError } = await supabase
    .from('pontuacoes')
    .select('id, atleta_id')
    .eq('evento_id', eventId)
    .eq('modalidade_id', modalityIdInt)
    .eq('numero_bateria', numero_bateria)
    .eq('equipe_id', teamId)
    .in('atleta_id', teamMembers.map(m => m.atleta_id));
  
  if (existingError) {
    console.error('Error checking existing team records:', existingError);
  }
  
  const existingIds = existingRecords?.map(r => r.id) || [];
  
  if (existingIds.length > 0) {
    // Update existing records for this bateria
    console.log('Updating existing team scores for bateria:', numero_bateria);
    
    const updateData: any = {
      valor_pontuacao: recordData.valor_pontuacao,
      unidade: recordData.unidade,
      observacoes: recordData.observacoes,
      juiz_id: recordData.juiz_id,
      data_registro: recordData.data_registro
    };

    const { data: updateResult, error: updateError } = await supabase
      .from('pontuacoes')
      .update(updateData)
      .in('id', existingIds)
      .select('*');
    
    if (updateError) {
      console.error('Error updating team scores:', updateError);
      throw new Error(`Erro ao atualizar pontuações da equipe: ${updateError.message}`);
    }
    
    console.log('Team scores updated successfully for bateria:', numero_bateria);
    return { success: true, operation: 'team_update', data: updateResult };
  } else {
    // Insert new scores for all team members for this bateria
    console.log('Inserting new team scores for all members for bateria:', numero_bateria);
    
    const insertData = teamMembers.map(member => ({
      evento_id: recordData.evento_id,
      modalidade_id: recordData.modalidade_id,
      atleta_id: member.atleta_id,
      equipe_id: recordData.equipe_id,
      valor_pontuacao: recordData.valor_pontuacao,
      unidade: recordData.unidade,
      observacoes: recordData.observacoes,
      juiz_id: recordData.juiz_id,
      data_registro: recordData.data_registro,
      numero_bateria: numero_bateria
    }));
    
    const { data: insertResult, error: insertError } = await supabase
      .from('pontuacoes')
      .insert(insertData)
      .select('*');
    
    if (insertError) {
      console.error('Error in team score insertion for bateria:', insertError);
      throw new Error(`Erro ao inserir pontuações da equipe: ${insertError.message}`);
    }
    
    console.log('Team scores inserted successfully for bateria:', numero_bateria);
    return { success: true, operation: 'team_insert', data: insertResult };
  }
}
