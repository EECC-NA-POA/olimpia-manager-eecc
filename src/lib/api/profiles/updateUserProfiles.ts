
import { supabase } from '../../supabase';

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
