import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const useUserRoleCheck = (userId: string | undefined, eventId: string | null) => {
  return useQuery({
    queryKey: ['user-role-check', userId, eventId],
    queryFn: async () => {
      if (!userId || !eventId) return null;

      console.log('=== USER ROLE CHECK DEBUG ===');
      console.log('Checking roles for userId:', userId, 'eventId:', eventId);

      // First check if user exists in papeis_usuarios for this event and get their role codes
      const { data: userRolesData, error: userRolesError } = await supabase
        .from('papeis_usuarios')
        .select(`
          id,
          perfis!inner(
            perfis_tipo!inner(
              codigo
            )
          )
        `)
        .eq('usuario_id', userId)
        .eq('evento_id', eventId);

      console.log('Direct papeis_usuarios query:', { userRolesData, userRolesError });

      // Also check if user is registered for the event
      const { data: registration, error: regError } = await supabase
        .from('inscricoes_eventos')
        .select('*')
        .eq('usuario_id', userId)
        .eq('evento_id', eventId);

      console.log('Event registration check:', { registration, regError });

      // Get all profiles for this event to see what's available
      const { data: allProfiles, error: profilesError } = await supabase
        .from('perfis')
        .select('*')
        .eq('evento_id', eventId);

      console.log('Available profiles for event:', { allProfiles, profilesError });

      // Extract direct role codes from the joins
      const roleCodes = userRolesData?.map((r: any) => r.perfis?.perfis_tipo?.codigo) || [];
      const hasRoles = roleCodes.length > 0;
      const isRegistered = (registration || []).length > 0;

      const isOrganizer = roleCodes.includes('ORG') || roleCodes.includes('ADM');
      const isRepresentante = roleCodes.includes('DEL');
      const isFilosofoMonitor = roleCodes.includes('FMON') || roleCodes.includes('FMO') || roleCodes.includes('FILOSOFO_MONITOR') || roleCodes.includes('filosofo_monitor');

      return {
        userRoles: userRolesData || [],
        roleCodes,
        isOrganizer,
        isRepresentante,
        isFilosofoMonitor,
        registration: registration || [],
        availableProfiles: allProfiles || [],
        hasRoles,
        isRegistered
      };
    },
    enabled: !!userId && !!eventId,
  });
};