
import { supabase } from '@/lib/supabase';
import { ScoreRecordData, SaveScoreResult } from './types';

export async function handleTeamScore(
  recordData: ScoreRecordData, 
  eventId: string, 
  modalityIdInt: number, 
  teamId: number | null
): Promise<SaveScoreResult> {
  console.log('Starting team score handling for team:', teamId);
  
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
  
  // Delete existing scores for all team members first
  console.log('Deleting existing scores for team members');
  const { error: deleteError } = await supabase
    .from('pontuacoes')
    .delete()
    .eq('evento_id', eventId)
    .eq('modalidade_id', modalityIdInt)
    .in('atleta_id', teamMembers.map(m => m.atleta_id));
  
  if (deleteError) {
    console.error('Error deleting existing scores:', deleteError);
    // Continue with insertion even if delete fails
  }
  
  // Insert new scores for all team members
  console.log('Inserting new team scores for all members');
  const insertData = teamMembers.map(member => ({
    ...recordData,
    atleta_id: member.atleta_id
  }));
  
  const { data: insertResult, error: insertError } = await supabase
    .from('pontuacoes')
    .insert(insertData)
    .select('*');
  
  if (insertError) {
    console.error('Error in team score insertion:', insertError);
    throw new Error(`Erro ao inserir pontuações da equipe: ${insertError.message}`);
  }
  
  console.log('Team scores inserted successfully');
  return { success: true, operation: 'team_insert', data: insertResult };
}
