
import { supabase } from '../../supabase';

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
