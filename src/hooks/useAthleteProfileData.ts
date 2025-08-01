
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { AthleteProfileData } from "@/types/athlete";

export const useAthleteProfileData = (userId: string | undefined, currentEventId: string | null) => {
  return useQuery({
    queryKey: ['athlete-profile', userId, currentEventId],
    queryFn: async () => {
      if (!userId || !currentEventId) return null;
      console.log('=== FETCHING ATHLETE PROFILE DATA ===');
      console.log('User ID:', userId, 'Event ID:', currentEventId);

      // Strategy 1: Use the updated get_user_profile_safe function
      console.log('Strategy 1: Using get_user_profile_safe function...');
      const { data: profileDataArray, error: profileError } = await supabase
        .rpc('get_user_profile_safe', { p_user_id: userId });

      let profileData = null;
      if (profileDataArray && profileDataArray.length > 0) {
        profileData = profileDataArray[0];
      }

      if (profileError) {
        console.error('Error from get_user_profile_safe:', profileError);
        
        // Strategy 2: Fallback to view_perfil_atleta
        console.log('Strategy 2: Fallback to view_perfil_atleta...');
        const { data: viewData, error: viewError } = await supabase
          .from('view_perfil_atleta')
          .select('*')
          .eq('id', userId)
          .single();

        if (viewError) {
          console.error('Error fetching from view_perfil_atleta:', viewError);
          return null;
        }

        profileData = viewData;
      }

      if (!profileData) {
        console.log('No profile data found');
        return null;
      }

      console.log('Profile data retrieved:', profileData);

      // Parse papeis if it's from the RPC function (should be jsonb)
      let transformedRoles = [];
      if (profileData.papeis) {
        if (typeof profileData.papeis === 'string') {
          try {
            transformedRoles = JSON.parse(profileData.papeis);
          } catch (e) {
            console.error('Error parsing papeis JSON:', e);
            transformedRoles = [];
          }
        } else if (Array.isArray(profileData.papeis)) {
          transformedRoles = profileData.papeis;
        } else {
          console.log('Papeis data type:', typeof profileData.papeis);
          transformedRoles = [];
        }
      }

      // If no roles found, check registration status and assign default Atleta role
      if (transformedRoles.length === 0) {
        console.log('No roles found, checking registration status...');
        
        const { data: registrationData, error: registrationError } = await supabase
          .from('inscricoes_modalidades')
          .select('*')
          .eq('atleta_id', userId)
          .eq('evento_id', currentEventId)
          .limit(1);

        if (!registrationError && registrationData && registrationData.length > 0) {
          console.log('User has registrations, assigning default Atleta role');
          transformedRoles = [{
            id: null,
            nome: 'Atleta',
            codigo: 'ATL'
          }];
        }
      }

      console.log('🎯 Final transformed roles:', transformedRoles);
      console.log('📊 Total roles found:', transformedRoles.length);
      console.log('🏃‍♂️ Has athlete role:', transformedRoles.some(role => role.codigo === 'ATL' || role.nome === 'Atleta'));

      return {
        ...profileData,
        id: profileData.id || userId,
        papeis: transformedRoles,
        pagamento_status: profileData.pagamento_status?.toLowerCase() || 'pendente'
      } as AthleteProfileData;
    },
    enabled: !!userId && !!currentEventId,
  });
};
