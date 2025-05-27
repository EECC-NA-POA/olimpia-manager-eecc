
import { supabase } from '@/lib/supabase';

export async function getModalityInfo(modalityId: number) {
  console.log('Fetching modality info for ID:', modalityId);
  
  const { data: modalityInfo, error: modalityError } = await supabase
    .from('modalidades')
    .select('tipo_modalidade')
    .eq('id', modalityId)
    .single();
  
  if (modalityError) {
    console.error('Error fetching modality info:', modalityError);
    throw new Error(`Erro ao buscar informações da modalidade: ${modalityError.message}`);
  }
  
  const isTeamModality = modalityInfo?.tipo_modalidade?.includes('COLETIVA');
  console.log('Is team modality:', isTeamModality);
  console.log('Modality type:', modalityInfo?.tipo_modalidade);
  
  return { isTeamModality, modalityInfo };
}

export async function getTeamId(athlete: any, modalityId: number, eventId: string, isTeamModality: boolean) {
  let teamId = athlete.equipe_id;
  
  if (isTeamModality && !teamId) {
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('inscricoes_modalidades')
      .select('equipe_id')
      .eq('modalidade_id', modalityId)
      .eq('atleta_id', athlete.atleta_id)
      .eq('evento_id', eventId)
      .maybeSingle();
    
    if (enrollmentError) {
      console.error('Error fetching team enrollment:', enrollmentError);
      throw new Error(`Erro ao buscar inscrição da equipe: ${enrollmentError.message}`);
    } else if (enrollment) {
      teamId = enrollment.equipe_id;
      console.log('Found team ID from enrollment:', teamId);
    }
  }
  
  return teamId;
}

export async function getBateriaId(finalScoreData: any, modalityId: number, eventId: string) {
  let bateriaId = finalScoreData.bateria_id;
  
  if (!bateriaId) {
    console.log('No bateria_id provided, fetching default bateria for modality');
    const { data: bateriaResults, error: bateriaError } = await supabase
      .from('baterias')
      .select('id')
      .eq('modalidade_id', modalityId)
      .eq('evento_id', eventId)
      .limit(1);
    
    if (bateriaError) {
      console.error('Error fetching bateria:', bateriaError);
      throw new Error(`Erro ao buscar bateria: ${bateriaError.message}`);
    }
    
    if (!bateriaResults || bateriaResults.length === 0) {
      throw new Error('Nenhuma bateria encontrada para esta modalidade. Configure as baterias primeiro.');
    }
    
    bateriaId = bateriaResults[0].id;
    console.log('Using default bateria ID:', bateriaId);
  }
  
  return parseInt(bateriaId.toString(), 10);
}
