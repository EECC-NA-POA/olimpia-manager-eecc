
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
      console.log('No baterias found, attempting to create them automatically...');
      
      // Try to auto-create baterias if they don't exist
      try {
        await createMissingBaterias(modalityId, eventId);
        
        // Try fetching again after creation
        const { data: newBateriaResults, error: newBateriaError } = await supabase
          .from('baterias')
          .select('id')
          .eq('modalidade_id', modalityId)
          .eq('evento_id', eventId)
          .limit(1);
        
        if (newBateriaError || !newBateriaResults || newBateriaResults.length === 0) {
          throw new Error('Nenhuma bateria encontrada após tentativa de criação automática.');
        }
        
        bateriaId = newBateriaResults[0].id;
        console.log('Using auto-created bateria ID:', bateriaId);
      } catch (createError) {
        console.error('Failed to auto-create baterias:', createError);
        throw new Error('Nenhuma bateria encontrada para esta modalidade. Configure as baterias primeiro nas regras da modalidade.');
      }
    } else {
      bateriaId = bateriaResults[0].id;
      console.log('Using existing bateria ID:', bateriaId);
    }
  }
  
  return parseInt(bateriaId.toString(), 10);
}

async function createMissingBaterias(modalityId: number, eventId: string) {
  console.log('Attempting to auto-create missing baterias for modality:', modalityId);
  
  // First, check if this modality has a rule that requires baterias
  const { data: rule, error: ruleError } = await supabase
    .from('modalidade_regras')
    .select('regra_tipo, parametros')
    .eq('modalidade_id', modalityId)
    .maybeSingle();
  
  if (ruleError) {
    console.error('Error fetching rule for auto-creation:', ruleError);
    throw new Error('Não foi possível verificar as regras da modalidade');
  }
  
  if (!rule) {
    throw new Error('Modalidade não possui regras configuradas');
  }
  
  const needsBaterias = rule.regra_tipo === 'baterias' || 
                        (rule.regra_tipo === 'tempo' && rule.parametros?.baterias === true) ||
                        (rule.regra_tipo === 'distancia' && rule.parametros?.baterias === true);
  
  if (!needsBaterias) {
    throw new Error('Esta modalidade não está configurada para usar baterias');
  }
  
  // Determine number of baterias to create
  let numBaterias = 1; // Default
  if (rule.regra_tipo === 'baterias') {
    numBaterias = Math.max(rule.parametros?.num_tentativas || 1, 1);
  } else if (rule.parametros?.num_baterias) {
    numBaterias = rule.parametros.num_baterias;
  } else if (rule.parametros?.num_tentativas) {
    numBaterias = rule.parametros.num_tentativas;
  }
  
  console.log(`Auto-creating ${numBaterias} baterias`);
  
  // Create baterias directly
  const bateriasToInsert = [];
  for (let i = 1; i <= numBaterias; i++) {
    bateriasToInsert.push({
      modalidade_id: modalityId,
      evento_id: eventId,
      numero: i
    });
  }
  
  const { data: insertedBaterias, error: insertError } = await supabase
    .from('baterias')
    .insert(bateriasToInsert)
    .select();
  
  if (insertError) {
    console.error('Error auto-creating baterias:', insertError);
    throw new Error(`Erro ao criar baterias automaticamente: ${insertError.message}`);
  }
  
  console.log(`Successfully auto-created ${numBaterias} baterias:`, insertedBaterias);
  return insertedBaterias;
}
