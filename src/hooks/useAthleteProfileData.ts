
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { AthleteProfileData } from "@/types/athlete";

export const useAthleteProfileData = (userId: string | undefined, currentEventId: string | null) => {
  return useQuery({
    queryKey: ['athlete-profile', userId, currentEventId],
    queryFn: async () => {
      if (!userId || !currentEventId) return null;
      console.log('Fetching athlete profile for:', userId, 'event:', currentEventId);

      // Get profile data including payment status from the view
      const { data: profileData, error: profileError } = await supabase
        .from('view_perfil_atleta')
        .select('*')
        .eq('atleta_id', userId)
        .eq('evento_id', currentEventId)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }

      if (!profileData) {
        console.log('No profile data found for event');
        return null;
      }

      console.log('Retrieved profile data:', {
        userId,
        eventId: currentEventId,
        numero_identificador: profileData.numero_identificador,
        pagamento_status: profileData.pagamento_status,
        payment_info: {
          status: profileData.pagamento_status,
          valor: profileData.pagamento_valor,
          data_criacao: profileData.pagamento_data_criacao,
          data_validacao: profileData.data_validacao
        }
      });

      // Enhanced role fetching with multiple strategies
      console.log('🔍 Fetching roles for userId:', userId, 'eventId:', currentEventId);
      
      let transformedRoles: any[] = [];
      
      // Strategy 1: Direct query to papeis_usuarios 
      console.log('📊 Strategy 1: Direct papeis_usuarios query');
      const { data: rolesData, error: rolesError } = await supabase
        .from('papeis_usuarios')
        .select(`
          perfil_id,
          perfis (
            id,
            nome,
            perfil_tipo_id
          )
        `)
        .eq('usuario_id', userId)
        .eq('evento_id', currentEventId);

      console.log('📋 Direct roles result:', { rolesData, rolesError, count: rolesData?.length || 0 });

      if (rolesData && rolesData.length > 0) {
        transformedRoles = rolesData.map((roleData: any) => ({
          nome: roleData.perfis?.nome || 'Unknown',
          codigo: roleData.perfis?.perfil_tipo_id || 'UNK'
        }));
        console.log('✅ Strategy 1 successful, roles found:', transformedRoles);
      } else {
        // Strategy 2: Fallback to inscricoes_eventos selected_role
        console.log('📊 Strategy 2: Fallback to inscricoes_eventos');
        const { data: registrationData, error: regError } = await supabase
          .from('inscricoes_eventos')
          .select(`
            selected_role
          `)
          .eq('usuario_id', userId)
          .eq('evento_id', currentEventId)
          .maybeSingle();

        console.log('📋 Registration fallback result:', { registrationData, regError });

        if (registrationData && registrationData.selected_role) {
          // Get the profile info for the selected role
          const { data: profileInfo, error: profileError } = await supabase
            .from('perfis')
            .select(`
              id,
              nome,
              perfil_tipo_id
            `)
            .eq('id', registrationData.selected_role)
            .maybeSingle();

          console.log('📋 Profile info result:', { profileInfo, profileError });

          if (profileInfo) {
            transformedRoles = [{
              nome: profileInfo.nome || 'Unknown',
              codigo: profileInfo.perfil_tipo_id || 'UNK'
            }];
            console.log('✅ Strategy 2 successful, role from registration:', transformedRoles);
            
            // Auto-create missing papeis_usuarios record
            console.log('🔧 Auto-creating missing papeis_usuarios record');
            const { error: insertError } = await supabase
              .from('papeis_usuarios')
              .insert({
                usuario_id: userId,
                evento_id: currentEventId,
                perfil_id: registrationData.selected_role
              });
            
            if (insertError) {
              console.warn('⚠️ Failed to auto-create papeis_usuarios record:', insertError);
            } else {
              console.log('✅ Auto-created papeis_usuarios record');
            }
          }
        } else {
          // Strategy 3: Create default athlete profile if user is registered
          console.log('📊 Strategy 3: Create default athlete profile');
          const { data: eventRegistration, error: eventError } = await supabase
            .from('inscricoes_eventos')
            .select('*')
            .eq('usuario_id', userId)
            .eq('evento_id', currentEventId)
            .maybeSingle();

          if (eventRegistration) {
            // Find default athlete profile for this event
            const { data: athleteProfile, error: athleteError } = await supabase
              .from('perfis')
              .select('*')
              .eq('evento_id', currentEventId)
              .eq('perfil_tipo_id', 'ATL')
              .maybeSingle();

            if (athleteProfile) {
              transformedRoles = [{
                nome: athleteProfile.nome || 'Atleta',
                codigo: athleteProfile.perfil_tipo_id || 'ATL'
              }];
              console.log('✅ Strategy 3 successful, assigned default athlete role:', transformedRoles);
            } else {
              console.log('❌ No athlete profile found for event');
            }
          } else {
            console.log('❌ User not registered for event');
          }
        }
      }

      console.log('🎯 Final transformed roles:', transformedRoles);
      console.log('📊 Total roles found:', transformedRoles.length);

      return {
        ...profileData,
        id: profileData.atleta_id,
        papeis: transformedRoles,
        pagamento_status: profileData.pagamento_status?.toLowerCase() || 'pendente'
      } as AthleteProfileData;
    },
    enabled: !!userId && !!currentEventId,
  });
};
