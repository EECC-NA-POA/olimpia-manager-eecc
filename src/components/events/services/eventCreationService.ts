
import { supabase } from '@/lib/supabase';
import { EventFormValues } from '../EventFormSchema';

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

// Simplified event creation without diagnostic dependency
async function createEventWithTimeout(eventData: any, timeoutMs = 30000) {
  console.log('⏳ Creating event in database...');
  
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
      throw new Error(`Erro de permissão RLS. Verifique se você está logado e tem permissão para criar eventos.`);
    }
    
    throw error;
  }
}

export async function createEventWithProfiles(data: EventFormValues, userId: string) {
  console.log('🚀 Starting event creation');
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

    // Create event
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
      try {
        await createEventBranchRelationships(newEvent.id as string, data.selectedBranches);
      } catch (branchError) {
        console.error('❌ Error linking branches, but event was created:', branchError);
        // Don't throw here - the event was created successfully
        // Just warn the user that branch linking failed
        console.warn('⚠️ Event created but branch linking failed. You can link branches later in event management.');
      }
    }

    // Wait for default profiles trigger to complete
    console.log('⏳ Waiting for default profiles creation...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      await assignRolesToCreatorAndRegister(newEvent.id as string, userId);
    } catch (roleError) {
      console.error('❌ Error assigning roles and registering, but event was created:', roleError);
      // Don't throw here either - the event was created successfully
      console.warn('⚠️ Event created but role assignment failed. You can assign roles later in event management.');
    }

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
  
  // Prepare the data for insertion
  const branchRelationships = branchIds.map(branchId => ({
    evento_id: eventId,
    filial_id: branchId
  }));

  console.log('📝 Branch relationships to insert:', branchRelationships);

  const { error: branchError } = await supabase
    .from('eventos_filiais')
    .insert(branchRelationships);

  if (branchError) {
    console.error('❌ Error linking event to branches:', branchError);
    
    // Provide more specific error message for RLS issues
    if (branchError.code === '42501') {
      throw new Error('Erro de permissão ao vincular filiais. Verifique se você tem permissão para criar eventos e tente novamente.');
    }
    
    throw new Error('Evento criado, mas houve um erro ao vincular filiais');
  }
  
  console.log('✅ Branch relationships created successfully');
}

async function assignRolesToCreatorAndRegister(eventId: string, userId: string) {
  console.log('👤 Assigning admin and athlete roles to event creator and registering for event:', eventId);
  
  // Find both admin and athlete profiles created by trigger
  let adminProfile, athleteProfile;
  let attempts = 0;
  const maxAttempts = 5;
  
  while ((!adminProfile || !athleteProfile) && attempts < maxAttempts) {
    const { data: profiles, error } = await supabase
      .from('perfis')
      .select('id, nome')
      .eq('evento_id', eventId)
      .in('nome', ['Administração', 'Atleta']);
    
    if (profiles) {
      adminProfile = profiles.find(p => p.nome === 'Administração');
      athleteProfile = profiles.find(p => p.nome === 'Atleta');
    }
    
    if (adminProfile && athleteProfile) {
      break;
    }
    
    attempts++;
    if (attempts < maxAttempts) {
      console.log(`⏳ Profiles not found yet, retrying in 500ms... (attempt ${attempts}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  if (!adminProfile) {
    console.error('❌ Admin profile not found after trigger execution');
    throw new Error('Evento criado, mas houve um erro ao localizar perfil de administração');
  }

  if (!athleteProfile) {
    console.error('❌ Athlete profile not found after trigger execution');
    throw new Error('Evento criado, mas houve um erro ao localizar perfil de atleta');
  }

  console.log('✅ Found profiles:', { adminId: adminProfile.id, athleteId: athleteProfile.id });
  
  // Assign both Administrator and Athlete profiles to the creator
  console.log('🔐 Assigning admin and athlete roles to user:', userId, 'for event:', eventId);
  
  const rolesToAssign = [
    {
      usuario_id: userId,
      perfil_id: adminProfile.id,
      evento_id: eventId
    },
    {
      usuario_id: userId,
      perfil_id: athleteProfile.id,
      evento_id: eventId
    }
  ];

  const { error: assignRoleError } = await supabase
    .from('papeis_usuarios')
    .insert(rolesToAssign);

  if (assignRoleError) {
    console.error('❌ Error assigning roles to creator:', assignRoleError);
    throw new Error('Evento criado, mas houve um erro ao atribuir papéis');
  }

  console.log('✅ Both admin and athlete roles assigned successfully');
  
  // Now get the athlete profile's registration fee to create the event registration
  console.log('📝 Getting athlete profile registration fee...');
  
  const { data: registrationFee, error: feeError } = await supabase
    .from('taxas_inscricao')
    .select('id, valor')
    .eq('perfil_id', athleteProfile.id)
    .single();

  if (feeError || !registrationFee) {
    console.error('❌ Error getting registration fee:', feeError);
    throw new Error('Evento criado e papéis atribuídos, mas houve um erro ao obter taxa de inscrição');
  }

  console.log('✅ Found registration fee:', registrationFee);
  
  // Create the event registration (inscricoes_eventos)
  console.log('📝 Creating event registration for the creator...');
  
  const { error: registrationError } = await supabase
    .from('inscricoes_eventos')
    .insert({
      usuario_id: userId,
      evento_id: eventId,
      selected_role: athleteProfile.id,
      taxa_inscricao_id: registrationFee.id,
      data_inscricao: new Date().toISOString()
    });

  if (registrationError) {
    console.error('❌ Error creating event registration:', registrationError);
    throw new Error('Evento criado e papéis atribuídos, mas houve um erro ao criar inscrição no evento');
  }

  console.log('✅ Event registration created successfully');
}
