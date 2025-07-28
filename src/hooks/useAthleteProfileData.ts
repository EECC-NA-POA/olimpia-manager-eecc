
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

      // Get user roles with detailed debugging
      console.log('Fetching roles for userId:', userId, 'eventId:', currentEventId);
      
      const { data: rolesData, error: rolesError } = await supabase
        .from('papeis_usuarios')
        .select(`
          perfis (
            nome,
            perfil_tipo:perfil_tipo_id (
              codigo
            )
          )
        `)
        .eq('usuario_id', userId)
        .eq('evento_id', currentEventId);

      console.log('Raw roles query result:', { rolesData, rolesError });

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
        // Don't throw error, continue with empty roles
      }

      // Alternative roles query if first one fails or returns empty
      let alternativeRoles = null;
      if (!rolesData || rolesData.length === 0) {
        console.log('No roles found, trying alternative query...');
        
        const { data: altRolesData, error: altRolesError } = await supabase
          .from('papeis_usuarios')
          .select('*')
          .eq('usuario_id', userId)
          .eq('evento_id', currentEventId);
        
        console.log('Alternative roles query result:', { altRolesData, altRolesError });
        alternativeRoles = altRolesData;
      }

      const transformedRoles = (rolesData || [])
        .filter(roleData => roleData && roleData.perfis)
        .map((roleData: any) => {
          try {
            return {
              nome: roleData.perfis?.nome || 'Unknown',
              codigo: roleData.perfis?.perfil_tipo?.codigo || 'UNK'
            };
          } catch (error) {
            console.error('Error transforming role data:', error, roleData);
            return null;
          }
        })
        .filter(Boolean);

      console.log('Transformed roles:', transformedRoles);
      console.log('Total roles found:', transformedRoles.length);

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
