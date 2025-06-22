
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

// Enhanced event creation with better error handling
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

// Enhanced function to wait for and verify profiles creation
async function waitForProfilesCreation(eventId: string, maxAttempts = 15, delayMs = 1000) {
  console.log('⏳ Waiting for profiles creation by trigger...');
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`🔍 Checking profiles existence (attempt ${attempt}/${maxAttempts})...`);
    
    const { data: profiles, error } = await supabase
      .from('perfis')
      .select('id, nome')
      .eq('evento_id', eventId)
      .in('nome', ['Atleta', 'Administração']);
    
    if (error) {
      console.error('❌ Error checking profiles:', error);
      throw new Error('Erro ao verificar criação de perfis');
    }
    
    if (profiles && profiles.length >= 2) {
      console.log('✅ Profiles found:', profiles);
      
      // Also verify that taxas_inscricao were created
      const { data: taxas, error: taxasError } = await supabase
        .from('taxas_inscricao')
        .select('id, perfil_id')
        .eq('evento_id', eventId);
      
      if (taxasError) {
        console.error('❌ Error checking taxas_inscricao:', taxasError);
        throw new Error('Erro ao verificar criação de taxas de inscrição');
      }
      
      if (taxas && taxas.length >= 2) {
        console.log('✅ Registration fees created by trigger:', taxas);
        return profiles;
      } else {
        console.log('⚠️ Profiles exist but registration fees not found, continuing...');
      }
    }
    
    if (attempt < maxAttempts) {
      console.log(`⏳ Profiles not ready yet, waiting ${delayMs}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  throw new Error('Timeout: Perfis não foram criados pelo trigger dentro do tempo esperado');
}

async function updateRegistrationFees(eventId: string, formData: EventFormValues) {
  console.log('💰 Updating registration fees with custom values...');
  
  try {
    // Wait for profiles to be created by trigger
    const profiles = await waitForProfilesCreation(eventId);
    
    // Update fees for each profile with all fields from taxas_inscricao table
    for (const profile of profiles) {
      const isAthlete = profile.nome === 'Atleta';
      
      const taxaData: any = {
        valor: isAthlete ? formData.taxa_atleta : formData.taxa_publico_geral,
        isento: isAthlete ? formData.isento_atleta : formData.isento_publico_geral,
        mostra_card: isAthlete ? formData.mostra_card_atleta : formData.mostra_card_publico_geral,
        evento_id: eventId
      };

      // Add optional fields if they exist
      if (isAthlete) {
        if (formData.pix_key_atleta) taxaData.pix_key = formData.pix_key_atleta;
        if (formData.data_limite_inscricao_atleta) {
          taxaData.data_limite_inscricao = formData.data_limite_inscricao_atleta.toISOString().split('T')[0];
        }
        if (formData.contato_nome_atleta) taxaData.contato_nome = formData.contato_nome_atleta;
        if (formData.contato_telefone_atleta) taxaData.contato_telefone = formData.contato_telefone_atleta;
        if (formData.link_formulario_atleta) taxaData.link_formulario = formData.link_formulario_atleta;
      } else {
        if (formData.pix_key_publico_geral) taxaData.pix_key = formData.pix_key_publico_geral;
        if (formData.data_limite_inscricao_publico_geral) {
          taxaData.data_limite_inscricao = formData.data_limite_inscricao_publico_geral.toISOString().split('T')[0];
        }
        if (formData.contato_nome_publico_geral) taxaData.contato_nome = formData.contato_nome_publico_geral;
        if (formData.contato_telefone_publico_geral) taxaData.contato_telefone = formData.contato_telefone_publico_geral;
        if (formData.link_formulario_publico_geral) taxaData.link_formulario = formData.link_formulario_publico_geral;
      }
      
      const { error: updateError } = await supabase
        .from('taxas_inscricao')
        .update(taxaData)
        .eq('perfil_id', profile.id);

      if (updateError) {
        console.error(`❌ Error updating fee for profile ${profile.nome}:`, updateError);
        throw new Error(`Erro ao atualizar taxa para perfil ${profile.nome}`);
      }
      
      console.log(`✅ Updated fee for ${profile.nome}: R$ ${taxaData.valor.toFixed(2)}`);
    }
    
    console.log('✅ Registration fees updated successfully');
    return profiles;
    
  } catch (error) {
    console.error('❌ Error in updateRegistrationFees:', error);
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

async function assignRolesToCreatorAndRegister(eventId: string, userId: string, profiles: any[]) {
  console.log('👤 Assigning admin and athlete roles to event creator and registering for event:', eventId);
  
  const adminProfile = profiles.find(p => p.nome === 'Administração');
  const athleteProfile = profiles.find(p => p.nome === 'Atleta');

  if (!adminProfile || !athleteProfile) {
    throw new Error('Perfis de administração ou atleta não encontrados');
  }

  console.log('✅ Found profiles:', { adminId: adminProfile.id, athleteId: athleteProfile.id });
  
  // Step 1: Assign both Administrator and Athlete profiles to the creator in papeis_usuarios
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
  
  // Step 2: Get the athlete profile's registration fee to create the event registration
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
  
  // Step 3: Create the event registration (inscricoes_eventos)
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
  
  // The trigger create_event_payment will automatically create the payment record
  console.log('✅ Payment record will be created automatically by trigger');
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
    
    // Update registration fees with custom values and wait for profiles
    const profiles = await updateRegistrationFees(newEvent.id as string, data);
    
    // If branches were selected, create the event-branch relationships
    if (data.selectedBranches && data.selectedBranches.length > 0) {
      console.log('🏢 Creating branch relationships...');
      await createEventBranchRelationships(newEvent.id as string, data.selectedBranches);
    }
    
    // Assign roles to creator and register them in the event
    await assignRolesToCreatorAndRegister(newEvent.id as string, userId, profiles);

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
