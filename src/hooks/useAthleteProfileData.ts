
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
      
      // Strategy 1: Enhanced query with explicit JOINs  
      console.log('📊 Strategy 1: Enhanced papeis_usuarios query with explicit JOINs');
      const { data: rolesData, error: rolesError } = await supabase
        .from('papeis_usuarios')
        .select(`
          perfil_id,
          perfis!inner (
            id,
            nome,
            perfis_tipo!inner (
              codigo
            )
          )
        `)
        .eq('usuario_id', userId)
        .eq('evento_id', currentEventId);

      console.log('📋 Enhanced roles query result:', { 
        rolesData, 
        rolesError, 
        count: rolesData?.length || 0,
        rawData: rolesData 
      });

      if (rolesData && rolesData.length > 0) {
        transformedRoles = rolesData.map((roleData: any) => {
          console.log('📝 Processing role data:', roleData);
          return {
            nome: roleData.perfis?.nome || 'Unknown',
            codigo: roleData.perfis?.perfis_tipo?.codigo || 'UNK',
            id: roleData.perfis?.id
          };
        });
        console.log('✅ Strategy 1 successful, roles found:', transformedRoles);
      } else {
        // Strategy 1.5: Use RPC function to bypass RLS issues
        console.log('📊 Strategy 1.5: Using RPC function to bypass RLS');
        const { data: rpcRoles, error: rpcError } = await supabase
          .rpc('get_user_roles_with_codes', {
            p_user_id: userId,
            p_event_id: currentEventId
          });

        console.log('📋 RPC roles result:', { rpcRoles, rpcError, count: rpcRoles?.length || 0 });

        if (rpcRoles && rpcRoles.length > 0) {
          transformedRoles = rpcRoles.map((role: any) => ({
            nome: role.nome,
            codigo: role.codigo,
            id: role.perfil_id
          }));
          console.log('✅ Strategy 1.5 successful, roles found via RPC:', transformedRoles);
        }
      }
      
      // Strategy 2: Fallback to inscricoes_eventos selected_role
      if (transformedRoles.length === 0) {
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
          // Get the profile info for the selected role with proper JOIN
          const { data: profileInfo, error: profileError } = await supabase
            .from('perfis')
            .select(`
              id,
              nome,
              perfis_tipo (
                codigo
              )
            `)
            .eq('id', registrationData.selected_role)
            .maybeSingle();

          console.log('📋 Profile info result:', { profileInfo, profileError });

          if (profileInfo) {
            transformedRoles = [{
              nome: profileInfo.nome || 'Unknown',
              codigo: (profileInfo.perfis_tipo as any)?.codigo || 'UNK'
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
          console.log('❌ No registration or selected_role found');
        }

        // Strategy 3: Final fallback - check if user is registered and assign default athlete role
        if (transformedRoles.length === 0) {
          console.log('📊 Strategy 3: Final fallback - check registration for default role');
          const { data: eventRegistration, error: eventError } = await supabase
            .from('inscricoes_eventos')
            .select('id')
            .eq('usuario_id', userId)
            .eq('evento_id', currentEventId)
            .maybeSingle();

          console.log('📋 Registration check result:', { eventRegistration, eventError });

          if (eventRegistration) {
            console.log('✅ User is registered, assigning default athlete role');
            transformedRoles = [{
              nome: 'Atleta',
              codigo: 'ATL',
              id: 1
            }];
          } else {
            console.log('❌ User is not registered for this event');
          }
        }
      }

      console.log('🎯 Final transformed roles:', transformedRoles);
      console.log('📊 Total roles found:', transformedRoles.length);
      console.log('🏃‍♂️ Has athlete role:', transformedRoles.some(role => role.codigo === 'ATL' || role.nome === 'Atleta'));

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
