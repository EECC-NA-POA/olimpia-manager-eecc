
import { supabase } from '@/lib/supabase';

interface AthleteData {
  atleta_id: string;
  equipe_id?: number;
}

interface ScoreRecordData {
  evento_id: string;
  modalidade_id: number;
  atleta_id: string;
  equipe_id: number | null;
  valor_pontuacao: any;
  unidade: any;
  observacoes: any;
  juiz_id: any;
  data_registro: any;
  tempo_minutos?: number;
  tempo_segundos?: number;
  bateria_id: number;
}

export async function saveScoreToDatabase(
  finalScoreData: any,
  eventId: string,
  modalityId: number,
  athlete: AthleteData
) {
  console.log('=== STARTING SCORE SAVE OPERATION ===');
  console.log('Final score data:', finalScoreData);
  console.log('Event ID:', eventId);
  console.log('Modality ID (type check):', modalityId, typeof modalityId);
  console.log('Athlete ID:', athlete.atleta_id);
  
  try {
    // Ensure modalityId is a proper integer
    const modalityIdInt = parseInt(modalityId.toString(), 10);
    console.log('Converted modalityId to integer:', modalityIdInt);
    
    // Check if this is a team modality
    const { data: modalityInfo, error: modalityError } = await supabase
      .from('modalidades')
      .select('tipo_modalidade')
      .eq('id', modalityIdInt)
      .single();
    
    if (modalityError) {
      console.error('Error fetching modality info:', modalityError);
      throw new Error(`Erro ao buscar informações da modalidade: ${modalityError.message}`);
    }
    
    const isTeamModality = modalityInfo?.tipo_modalidade?.includes('COLETIVA');
    console.log('Is team modality:', isTeamModality);
    
    // For team modalities, get the team ID from athlete enrollment
    let teamId = athlete.equipe_id;
    if (isTeamModality && !teamId) {
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('inscricoes_modalidades')
        .select('equipe_id')
        .eq('modalidade_id', modalityIdInt)
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
    
    // Ensure bateria_id is provided - if not, we need to get a default one
    let bateriaId = finalScoreData.bateria_id;
    
    if (!bateriaId) {
      console.log('No bateria_id provided, fetching default bateria for modality');
      const { data: bateriaResults, error: bateriaError } = await supabase
        .from('baterias')
        .select('id')
        .eq('modalidade_id', modalityIdInt)
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

    // Prepare the complete record data with explicit type conversion
    const recordData: ScoreRecordData = {
      evento_id: eventId,
      modalidade_id: modalityIdInt,
      atleta_id: athlete.atleta_id,
      equipe_id: teamId || null,
      valor_pontuacao: finalScoreData.valor_pontuacao || null,
      unidade: finalScoreData.unidade || 'pontos',
      observacoes: finalScoreData.observacoes || null,
      juiz_id: finalScoreData.juiz_id,
      data_registro: finalScoreData.data_registro || new Date().toISOString(),
      bateria_id: parseInt(bateriaId.toString(), 10)
    };

    // Add optional time fields if they exist
    if (finalScoreData.tempo_minutos !== undefined && finalScoreData.tempo_minutos !== null) {
      recordData.tempo_minutos = finalScoreData.tempo_minutos;
    }
    if (finalScoreData.tempo_segundos !== undefined && finalScoreData.tempo_segundos !== null) {
      recordData.tempo_segundos = finalScoreData.tempo_segundos;
    }

    console.log('Record data to save:', JSON.stringify(recordData, null, 2));
    
    // For team modalities, handle team score replication manually to avoid trigger issues
    if (isTeamModality) {
      console.log('Team modality detected - handling team score replication manually');
      
      // First, try to disable triggers temporarily (if we have proper permissions)
      console.log('Attempting to handle team scores manually to avoid trigger conflicts');
      
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
      
      // Check for existing scores for any team member
      const { data: existingScores, error: existingError } = await supabase
        .from('pontuacoes')
        .select('id, atleta_id')
        .eq('evento_id', eventId)
        .eq('modalidade_id', modalityIdInt)
        .in('atleta_id', teamMembers?.map(m => m.atleta_id) || []);
      
      if (existingError) {
        console.error('Error checking existing scores:', existingError);
        throw new Error('Erro ao verificar pontuações existentes');
      }
      
      if (existingScores && existingScores.length > 0) {
        // Update existing scores for all team members
        console.log('Updating existing team scores');
        const updatePromises = teamMembers?.map(member => {
          const memberRecordData = {
            ...recordData,
            atleta_id: member.atleta_id
          };
          
          return supabase
            .from('pontuacoes')
            .update(memberRecordData)
            .eq('evento_id', eventId)
            .eq('modalidade_id', modalityIdInt)
            .eq('atleta_id', member.atleta_id);
        }) || [];
        
        const results = await Promise.all(updatePromises);
        const errors = results.filter(result => result.error);
        
        if (errors.length > 0) {
          console.error('Errors updating team scores:', errors);
          const errorMessage = errors[0].error?.message || 'Erro desconhecido';
          
          // Handle specific SQL errors
          if (errorMessage.includes('missing FROM-clause entry for table "p"')) {
            throw new Error('Erro no trigger de banco de dados. A funcionalidade de equipes pode estar com problemas de configuração.');
          }
          
          throw new Error(`Erro ao atualizar pontuações da equipe: ${errorMessage}`);
        }
        
        console.log('Team scores updated successfully');
        return { success: true, operation: 'update', data: recordData };
      } else {
        // Insert new scores for all team members
        console.log('Inserting new team scores');
        const insertData = teamMembers?.map(member => ({
          ...recordData,
          atleta_id: member.atleta_id
        })) || [];
        
        // Try inserting one by one to isolate any trigger issues
        const insertResults = [];
        for (const memberData of insertData) {
          console.log('Inserting score for team member:', memberData.atleta_id);
          const { data: insertResult, error: insertError } = await supabase
            .from('pontuacoes')
            .insert([memberData])
            .select('*');
          
          if (insertError) {
            console.error('Error inserting score for member:', memberData.atleta_id, insertError);
            
            // Handle specific SQL errors
            if (insertError.message.includes('missing FROM-clause entry for table "p"')) {
              throw new Error('Erro no trigger de banco de dados (FROM-clause). A funcionalidade pode estar mal configurada no servidor.');
            }
            
            throw new Error(`Erro ao inserir pontuação para membro da equipe: ${insertError.message}`);
          }
          
          insertResults.push(insertResult);
        }
        
        console.log('Team scores inserted successfully');
        return { success: true, operation: 'insert', data: insertResults };
      }
    } else {
      // Individual modality - use normal flow with enhanced error handling
      console.log('Individual modality - using standard insertion');
      
      // Check for existing record
      const { data: existingRecords, error: fetchError } = await supabase
        .from('pontuacoes')
        .select('id')
        .eq('evento_id', eventId)
        .eq('modalidade_id', modalityIdInt)
        .eq('atleta_id', athlete.atleta_id);
      
      if (fetchError) {
        console.error('Error checking for existing record:', fetchError);
        throw new Error(`Erro ao verificar pontuação existente: ${fetchError.message}`);
      }
      
      const existingRecord = existingRecords && existingRecords.length > 0 ? existingRecords[0] : null;
      console.log('Existing record found:', existingRecord ? 'Yes' : 'No');
      
      let result;
      let operation;
      
      if (existingRecord) {
        // Update existing record
        console.log('Updating existing record with ID:', existingRecord.id);
        const { data: updateData, error: updateError } = await supabase
          .from('pontuacoes')
          .update(recordData)
          .eq('id', existingRecord.id)
          .select('*');
        
        if (updateError) {
          console.error('Error in update operation:', updateError);
          
          // Handle specific SQL errors
          if (updateError.message.includes('missing FROM-clause entry for table "p"')) {
            throw new Error('Erro no trigger de banco de dados (FROM-clause). Contacte o administrador sobre problemas na configuração do servidor.');
          }
          
          throw new Error(`Erro ao atualizar pontuação: ${updateError.message}`);
        }
        
        result = updateData && updateData.length > 0 ? updateData[0] : null;
        operation = 'update';
      } else {
        // Insert new record
        console.log('Inserting new record');
        console.log('Data being inserted (final check):', JSON.stringify(recordData, null, 2));
        
        const { data: insertData, error: insertError } = await supabase
          .from('pontuacoes')
          .insert([recordData])
          .select('*');
        
        if (insertError) {
          console.error('Error in insert operation:', insertError);
          console.error('Insert error details:', JSON.stringify(insertError, null, 2));
          
          // Handle specific SQL errors with more detailed messages
          if (insertError.message.includes('missing FROM-clause entry for table "p"')) {
            throw new Error('Erro crítico no banco de dados: problema na configuração de triggers. Contacte o administrador sobre o erro FROM-clause na tabela "p".');
          }
          
          throw new Error(`Erro ao inserir pontuação: ${insertError.message}`);
        }
        
        result = insertData && insertData.length > 0 ? insertData[0] : null;
        operation = 'insert';
      }
      
      console.log('Score saved successfully:', result ? 'Success' : 'No data returned');
      return { 
        success: true, 
        data: result, 
        operation: operation 
      };
    }
    
  } catch (error: any) {
    console.error('=== SCORE SAVE OPERATION FAILED ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    
    // Handle specific database error codes with more informative messages
    if (error.code === '23505') {
      throw new Error('Já existe uma pontuação para este atleta nesta modalidade');
    }
    
    if (error.code === '42P01') {
      throw new Error('Erro crítico de configuração da base de dados. Problema com triggers ou funções SQL. Contacte o administrador.');
    }
    
    if (error.code === '23503') {
      throw new Error('Dados inválidos: verifique se o evento, modalidade e atleta existem');
    }
    
    // Handle the specific FROM-clause error even if it doesn't have a specific code
    if (error.message?.includes('missing FROM-clause entry for table "p"')) {
      throw new Error('Erro no trigger de banco de dados (FROM-clause). Esta é uma questão de configuração do servidor que requer atenção do administrador.');
    }
    
    throw error;
  }
}
