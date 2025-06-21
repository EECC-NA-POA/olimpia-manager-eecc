import { supabase } from '@/lib/supabase';
import { EventFormValues } from '../EventFormSchema';

// Function to ensure user can create events
async function ensureUserCanCreateEvents(userId: string) {
  console.log('🔐 Checking user permissions for event creation...');
  
  try {
    // Test current permissions
    const { data: permissionTest, error: testError } = await supabase
      .rpc('test_event_creation_permission');
      
    if (testError) {
      console.error('❌ Error testing permissions:', testError);
    } else {
      console.log('📊 Permission test result:', permissionTest);
    }
    
    // If user doesn't exist or can't create events, try to fix it
    if (!permissionTest?.user_exists_in_usuarios || !permissionTest?.can_create_events) {
      console.log('🔧 Creating/updating user record for event creation...');
      
      const { error: createError } = await supabase
        .rpc('create_user_record_for_event_creation');
        
      if (createError) {
        console.error('❌ Error creating user record:', createError);
        throw new Error('Não foi possível configurar permissões de usuário para criação de eventos');
      }
      
      console.log('✅ User record created/updated successfully');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error in ensureUserCanCreateEvents:', error);
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

// Function to create event with timeout protection
async function createEventWithTimeout(eventData: any, timeoutMs = 30000) {
  const createEventPromise = supabase
    .from('eventos')
    .insert(eventData)
    .select()
    .single();

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout: A operação demorou mais que 30 segundos')), timeoutMs);
  });

  return Promise.race([createEventPromise, timeoutPromise]);
}

export async function createEventWithProfiles(data: EventFormValues, userId: string) {
  console.log('🚀 Starting event creation with data:', data);
  
  // Ensure user has permissions to create events
  await ensureUserCanCreateEvents(userId);
  
  // Prepare and validate event data
  const eventData = prepareEventData(data);
  console.log('📝 Prepared event data (filtered undefined/null):', eventData);

  // Validate required fields
  if (!eventData.nome || !eventData.descricao || !eventData.tipo) {
    throw new Error('Campos obrigatórios não preenchidos');
  }

  try {
    // Create event with timeout protection
    console.log('⏳ Creating event in database...');
    const result = await createEventWithTimeout(eventData);
    
    if (result && typeof result === 'object' && 'error' in result && result.error) {
      console.error('❌ Database error during event creation:', result.error);
      throw result.error;
    }

    // Extract the event data - handle both direct data and wrapped response
    const newEvent = result && typeof result === 'object' && 'data' in result ? result.data : result;
    
    if (!newEvent || typeof newEvent !== 'object' || !('id' in newEvent)) {
      throw new Error('Erro inesperado: dados do evento não foram retornados corretamente');
    }
    
    console.log('✅ Event created successfully:', newEvent);
    console.log('✅ Default profiles should be created automatically by trigger');
    
    // If branches were selected, create the event-branch relationships
    if (data.selectedBranches && data.selectedBranches.length > 0) {
      console.log('🏢 Creating branch relationships...');
      await createEventBranchRelationships(newEvent.id as string, data.selectedBranches);
    }

    // Assign admin role to creator - wait a bit for trigger to complete
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
    
    // Re-throw the original error if we can't provide a better message
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
