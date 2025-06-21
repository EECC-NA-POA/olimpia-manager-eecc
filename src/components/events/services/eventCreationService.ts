
import { supabase } from '@/lib/supabase';
import { EventFormValues } from '../EventFormSchema';

export async function createEventWithProfiles(data: EventFormValues, userId: string) {
  console.log('🚀 Starting event creation with data:', data);
  
  // Format dates to ISO strings
  const eventData = {
    nome: data.nome,
    descricao: data.descricao,
    tipo: data.tipo,
    data_inicio_inscricao: data.data_inicio_inscricao.toISOString().split('T')[0],
    data_fim_inscricao: data.data_fim_inscricao.toISOString().split('T')[0],
    status_evento: data.status_evento,
    visibilidade_publica: data.visibilidade_publica,
    foto_evento: data.foto_evento
  };

  console.log('📝 Event data to be inserted:', eventData);

  const { error, data: newEvent } = await supabase
    .from('eventos')
    .insert(eventData)
    .select()
    .single();

  if (error) {
    console.error('❌ Error inserting event:', error);
    throw error;
  }

  console.log('✅ Event created successfully:', newEvent);
  
  // If branches were selected, create the event-branch relationships
  if (data.selectedBranches && data.selectedBranches.length > 0) {
    await createEventBranchRelationships(newEvent.id, data.selectedBranches);
  }

  // Assign admin role to creator
  await assignAdminRoleToCreator(newEvent.id, userId);

  return newEvent;
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
    console.error('Error linking event to branches:', branchError);
    throw new Error('Evento criado, mas houve um erro ao vincular filiais');
  }
}

async function assignAdminRoleToCreator(eventId: string, userId: string) {
  console.log('👤 Looking for admin profile created by trigger for event:', eventId);
  
  const { data: adminProfile, error: profileError } = await supabase
    .from('perfis')
    .select('id')
    .eq('evento_id', eventId)
    .eq('nome', 'Administração')
    .single();

  if (profileError || !adminProfile) {
    console.error('❌ Error finding admin profile created by trigger:', profileError);
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
    console.error('Error assigning admin role to creator:', assignRoleError);
    throw new Error('Evento criado, mas houve um erro ao atribuir papel de administrador');
  }

  console.log('✅ Admin role assigned successfully');
}
