import { supabase } from '@/lib/supabase';
import { EventFormValues } from '../EventFormSchema';

// Enhanced diagnostic function with better error handling
async function diagnoseEventCreationIssue() {
  console.log('🔍 Diagnosing event creation issue...');
  
  try {
    // First check if we even have a session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error during diagnosis:', sessionError);
      return {
        success: false,
        error: `Session error: ${sessionError.message}`,
        hasSession: false
      };
    }
    
    if (!session) {
      console.error('❌ No active session found');
      return {
        success: false,
        error: 'No active session found',
        hasSession: false
      };
    }
    
    console.log('✅ Active session found:', {
      userId: session.user.id,
      email: session.user.email
    });
    
    // Run enhanced diagnosis
    const { data: diagnosis, error } = await supabase.rpc('diagnose_auth_and_rls');
    
    if (error) {
      console.error('❌ Error running enhanced diagnosis:', error);
      return {
        success: false,
        error: `Diagnosis error: ${error.message}`,
        hasSession: true
      };
    }
    
    console.log('📊 Enhanced diagnosis result:', diagnosis);
    return {
      success: true,
      hasSession: true,
      ...diagnosis
    };
  } catch (error) {
    console.error('❌ Error in diagnosis function:', error);
    return {
      success: false,
      error: `Diagnosis exception: ${error.message}`,
      hasSession: false
    };
  }
}

// Function to ensure user exists in usuarios table
async function ensureUserExistsInUsuarios(userId: string) {
  console.log('🔐 Checking if user exists in usuarios table...');
  
  try {
    // Check if user exists in usuarios table
    const { data: existingUser, error: checkError } = await supabase
      .from('usuarios')
      .select('id, email, cadastra_eventos')
      .eq('id', userId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking user existence:', checkError);
      throw checkError;
    }
    
    if (existingUser) {
      console.log('✅ User exists in usuarios table:', existingUser);
      
      // Ensure user can create events
      if (!existingUser.cadastra_eventos) {
        console.log('🔧 Updating user to allow event creation...');
        const { error: updateError } = await supabase
          .from('usuarios')
          .update({ cadastra_eventos: true })
          .eq('id', userId);
          
        if (updateError) {
          console.error('❌ Error updating user permissions:', updateError);
          throw updateError;
        }
        console.log('✅ User permissions updated');
      }
      
      return true;
    }
    
    // User doesn't exist, get auth user data to create record
    console.log('⚠️ User not found in usuarios table, creating record...');
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
      throw new Error('Não foi possível obter dados do usuário autenticado');
    }
    
    // Create user record in usuarios table
    const { error: insertError } = await supabase
      .from('usuarios')
      .insert({
        id: userId,
        email: authUser.email,
        nome_completo: authUser.user_metadata?.nome_completo || 'Usuário',
        telefone: authUser.user_metadata?.telefone || '',
        ddi: authUser.user_metadata?.ddi || '+55',
        tipo_documento: authUser.user_metadata?.tipo_documento || 'CPF',
        numero_documento: authUser.user_metadata?.numero_documento || '',
        genero: authUser.user_metadata?.genero || '',
        data_nascimento: authUser.user_metadata?.data_nascimento ? new Date(authUser.user_metadata.data_nascimento) : null,
        estado: authUser.user_metadata?.estado || '',
        filial_id: authUser.user_metadata?.filial_id || null,
        cadastra_eventos: true,
        confirmado: true
      });
    
    if (insertError) {
      console.error('❌ Error creating user record:', insertError);
      throw insertError;
    }
    
    console.log('✅ User record created successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Error in ensureUserExistsInUsuarios:', error);
    throw error;
  }
}

// Function to prepare event data by filtering out undefined/null values
function prepareEventData(data: EventFormValues) {
  const eventData: any = {
    nome: data.nome,
    descricao: data.descricao,
    tipo: data.tipo,
    data_inicio_inscricao: data.data_inicio_inscricao.toISOString().split('T')[0],
    data_fim_inscricao: data.data_fim_inscricao.toISOString().split('T')[0],
    status_evento: data.status_evento,
    visibilidade_publica: data.visibilidade_publica,
  };

  // Only add optional fields if they have valid values
  if (data.foto_evento && data.foto_evento.trim() !== '') {
    eventData.foto_evento = data.foto_evento;
  }

  if (data.data_inicio_evento) {
    eventData.data_inicio_evento = data.data_inicio_evento.toISOString().split('T')[0];
  }

  if (data.data_fim_evento) {
    eventData.data_fim_evento = data.data_fim_evento.toISOString().split('T')[0];
  }

  if (data.pais && data.pais.trim() !== '') {
    eventData.pais = data.pais;
  }

  if (data.estado && data.estado.trim() !== '') {
    eventData.estado = data.estado;
  }

  if (data.cidade && data.cidade.trim() !== '') {
    eventData.cidade = data.cidade;
  }

  return eventData;
}

// Enhanced event creation with better session handling
async function createEventWithTimeout(eventData: any, timeoutMs = 30000) {
  console.log('⏳ Creating event with enhanced session handling...');
  
  // First, run enhanced diagnosis
  const diagnosis = await diagnoseEventCreationIssue();
  
  if (!diagnosis.success) {
    throw new Error(`Diagnóstico falhou: ${diagnosis.error}`);
  }
  
  if (!diagnosis.hasSession) {
    throw new Error('Nenhuma sessão ativa encontrada. Faça login novamente.');
  }
  
  console.log('📋 Pre-creation diagnosis:', diagnosis);
  
  // Check basic requirements
  if (!diagnosis.user_exists_in_usuarios && diagnosis.auth_uid) {
    throw new Error('Usuário não encontrado na tabela usuarios. Entre em contato com o administrador.');
  }
  
  const createEventPromise = supabase
    .from('eventos')
    .insert(eventData)
    .select()
    .single();

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout: A operação demorou mais que 30 segundos')), timeoutMs);
  });

  try {
    const result = await Promise.race([createEventPromise, timeoutPromise]);
    console.log('✅ Event created successfully:', result);
    return result;
  } catch (error: any) {
    console.error('❌ Error creating event:', error);
    
    // Enhanced error handling
    if (error.code === '42501' || error.message?.includes('policy')) {
      console.log('🔍 RLS policy violation detected, running post-error diagnosis...');
      const postErrorDiagnosis = await diagnoseEventCreationIssue();
      
      if (postErrorDiagnosis.success) {
        console.log('📊 Post-error diagnosis:', postErrorDiagnosis);
        throw new Error(`Erro de permissão RLS. Status da sessão: ${postErrorDiagnosis.hasSession ? 'ativa' : 'inativa'}. Usuário autenticado: ${postErrorDiagnosis.auth_uid ? 'sim' : 'não'}.`);
      }
      
      throw new Error(`Erro de permissão: ${error.message}. Verifique se você está logado e tem permissão para criar eventos.`);
    }
    
    throw error;
  }
}

export async function createEventWithProfiles(data: EventFormValues, userId: string) {
  console.log('🚀 Starting event creation with enhanced session handling');
  console.log('📝 User ID provided:', userId);
  console.log('📝 Event data:', data);
  
  try {
    // Check session first
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Sessão expirada. Faça login novamente.');
    }
    
    // Ensure user exists in usuarios table and can create events
    await ensureUserExistsInUsuarios(userId);
    
    // Prepare and validate event data
    const eventData = prepareEventData(data);
    console.log('📝 Prepared event data:', eventData);

    // Validate required fields
    if (!eventData.nome || !eventData.descricao || !eventData.tipo) {
      throw new Error('Campos obrigatórios não preenchidos');
    }

    // Create event with enhanced error handling
    console.log('⏳ Creating event in database...');
    const result = await createEventWithTimeout(eventData);
    
    if (result && typeof result === 'object' && 'error' in result && result.error) {
      console.error('❌ Database error during event creation:', result.error);
      throw result.error;
    }

    const newEvent = result && typeof result === 'object' && 'data' in result ? result.data : result;
    
    if (!newEvent || typeof newEvent !== 'object' || !('id' in newEvent)) {
      throw new Error('Erro inesperado: dados do evento não foram retornados corretamente');
    }
    
    console.log('✅ Event created successfully:', newEvent);
    
    // If branches were selected, create the event-branch relationships
    if (data.selectedBranches && data.selectedBranches.length > 0) {
      console.log('🏢 Creating branch relationships...');
      await createEventBranchRelationships(newEvent.id as string, data.selectedBranches);
    }

    // Assign admin role to creator
    console.log('⏳ Waiting for trigger to complete and assigning admin role...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    await assignAdminRoleToCreator(newEvent.id as string, userId);

    return newEvent;
  } catch (error: any) {
    console.error('❌ Error in createEventWithProfiles:', error);
    
    // Provide more specific error messages
    if (error.message?.includes('Timeout')) {
      throw new Error('A operação demorou muito para ser concluída. Tente novamente.');
    }
    
    if (error.code === '23505') {
      if (error.message?.includes('eventos_nome_key') || error.constraint?.includes('nome')) {
        throw new Error('Já existe um evento com este nome. Escolha um nome diferente.');
      }
      throw new Error('Já existe um registro com essas informações. Verifique os dados.');
    }
    
    if (error.message?.includes('duplicate key value') || 
        error.message?.includes('unique constraint')) {
      throw new Error('Já existe um evento com essas informações. Verifique o nome.');
    }
    
    throw error;
  }
}

async function createEventBranchRelationships(eventId: string, branchIds: string[]) {
  console.log('🏢 Creating branch relationships for branches:', branchIds);
  
  const branchRelationships = branchIds.map(branchId => ({
    evento_id: eventId,
    filial_id: branchId
  }));

  const { error: branchError } = await supabase
    .from('eventos_filiais')
    .insert(branchRelationships);

  if (branchError) {
    console.error('❌ Error linking event to branches:', branchError);
    throw new Error('Evento criado, mas houve um erro ao vincular filiais');
  }
  
  console.log('✅ Branch relationships created successfully');
}

async function assignAdminRoleToCreator(eventId: string, userId: string) {
  console.log('👤 Looking for admin profile created by trigger for event:', eventId);
  
  // Retry logic to wait for trigger to complete
  let adminProfile;
  let attempts = 0;
  const maxAttempts = 5;
  
  while (!adminProfile && attempts < maxAttempts) {
    const { data, error } = await supabase
      .from('perfis')
      .select('id')
      .eq('evento_id', eventId)
      .eq('nome', 'Administração')
      .single();
    
    if (data) {
      adminProfile = data;
      break;
    }
    
    attempts++;
    if (attempts < maxAttempts) {
      console.log(`⏳ Admin profile not found yet, retrying in 500ms... (attempt ${attempts}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  if (!adminProfile) {
    console.error('❌ Admin profile not found after trigger execution');
    throw new Error('Evento criado, mas houve um erro ao localizar perfil de administração');
  }

  console.log('✅ Found admin profile with ID:', adminProfile.id);
  
  // Assign the current user the Administrator profile for this event
  console.log('🔐 Assigning admin role to user:', userId, 'for event:', eventId);
  
  const { error: assignRoleError } = await supabase
    .from('papeis_usuarios')
    .insert({
      usuario_id: userId,
      perfil_id: adminProfile.id,
      evento_id: eventId
    });

  if (assignRoleError) {
    console.error('❌ Error assigning admin role to creator:', assignRoleError);
    throw new Error('Evento criado, mas houve um erro ao atribuir papel de administrador');
  }

  console.log('✅ Admin role assigned successfully');
}
