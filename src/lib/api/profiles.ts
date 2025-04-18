
import { supabase } from '../supabase';

export const fetchUserProfiles = async (eventId: string | null) => {
  console.log('Fetching user profiles for event:', eventId);
  
  if (!eventId) {
    console.warn('No event ID provided for fetching user profiles');
    return [];
  }

  // Query all users registered in this event through inscricoes_eventos
  const { data: registeredUsers, error: registeredUsersError } = await supabase
    .from('inscricoes_eventos')
    .select('usuario_id')
    .eq('evento_id', eventId);

  if (registeredUsersError) {
    console.error('Error fetching registered users:', registeredUsersError);
    throw registeredUsersError;
  }

  if (!registeredUsers || registeredUsers.length === 0) {
    console.log('No registered users found for this event');
    return [];
  }

  // Extract the user IDs from the registered users
  const userIds = registeredUsers.map(registration => registration.usuario_id);
  console.log(`Found ${userIds.length} registered users for event ${eventId}`);

  // Now fetch the detailed user information for these users
  const { data: users, error: usersError } = await supabase
    .from('usuarios')
    .select(`
      id,
      nome_completo,
      email,
      filial_id,
      filiais:filial_id (
        nome
      ),
      papeis_usuarios (
        perfil_id,
        evento_id,
        perfis:perfil_id (
          nome
        )
      )
    `)
    .in('id', userIds)
    .order('nome_completo');

  if (usersError) {
    console.error('Error fetching users:', usersError);
    throw usersError;
  }

  console.log('Raw users data:', users);

  if (!users) return [];

  const formattedUsers = users.map((user: any) => {
    // Filter the user's roles to only include those for the current event
    const eventRoles = user.papeis_usuarios?.filter((papel: any) => 
      papel.evento_id === eventId
    ) || [];

    return {
      id: user.id,
      nome_completo: user.nome_completo,
      email: user.email,
      filial_id: user.filial_id,
      filial_nome: user.filiais?.nome || 'Sem filial',
      profiles: eventRoles.map((papel: any) => ({
        perfil_id: papel.perfil_id,
        perfil_nome: papel.perfis?.nome || ''
      }))
    };
  });

  console.log('Formatted users count:', formattedUsers.length);
  return formattedUsers;
};

export const updateUserProfiles = async (userId: string, profileIds: number[]): Promise<void> => {
  const currentEventId = localStorage.getItem('currentEventId');
  
  if (!currentEventId) {
    throw new Error('No event selected');
  }

  console.log('Updating user profiles:', {
    userId,
    profileIds,
    eventId: currentEventId
  });

  try {
    const { error, data } = await supabase
      .rpc('assign_user_profiles', {
        p_user_id: userId,
        p_profile_ids: profileIds,
        p_event_id: currentEventId
      });

    if (error) {
      console.error('Error in assign_user_profiles RPC call:', error);
      throw error;
    }

    console.log('Profile update successful, response:', data);

    const { data: updatedProfiles, error: verifyError } = await supabase
      .from('papeis_usuarios')
      .select('perfil_id')
      .eq('usuario_id', userId)
      .eq('evento_id', currentEventId);

    if (verifyError) {
      console.error('Error verifying profile update:', verifyError);
    } else {
      console.log('Profile verification - Current profiles:', updatedProfiles);
      
      const updatedProfileIds = updatedProfiles.map((p: any) => p.perfil_id);
      const allProfilesUpdated = profileIds.every(id => updatedProfileIds.includes(id)) && 
                               profileIds.length === updatedProfileIds.length;
      
      if (!allProfilesUpdated) {
        console.warn('Not all profiles were updated correctly!', {
          expected: profileIds,
          actual: updatedProfileIds
        });
      }
    }
  } catch (error) {
    console.error('Error updating user profiles:', error);
    throw error;
  }
};

export const swapUserProfile = async (
  userId: string,
  eventId: string,
  newProfileId: number,
  oldProfileId: number
): Promise<void> => {
  console.log('Starting swapUserProfile function...', {
    userId,
    eventId,
    newProfileId,
    oldProfileId
  });

  try {
    const { error } = await supabase
      .rpc('swap_user_profile', {
        p_user_id: userId,
        p_event_id: eventId,
        p_new_profile_id: newProfileId,
        p_old_profile_id: oldProfileId
      });

    if (error) {
      console.error('Error in swapUserProfile RPC call:', error);
      throw error;
    }

    const { data: updatedProfiles, error: checkError } = await supabase
      .from('papeis_usuarios')
      .select('perfil_id, perfis:perfil_id(nome)')
      .eq('usuario_id', userId)
      .eq('evento_id', eventId);

    if (checkError) {
      console.error('Error verifying profile swap:', checkError);
      throw checkError;
    }

    console.log('Profile swap verification - Current profiles:', updatedProfiles);

  } catch (error) {
    console.error('Error in swapUserProfile:', error);
    throw error;
  }
};
