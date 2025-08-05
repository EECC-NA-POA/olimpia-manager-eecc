import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const useUserRoleCheck = (userId: string | undefined, eventId: string | null) => {
  return useQuery({
    queryKey: ['user-role-check', userId, eventId],
    queryFn: async () => {
      if (!userId || !eventId) return null;
      
      console.log('=== USER ROLE CHECK DEBUG ===');
      console.log('Checking roles for userId:', userId, 'eventId:', eventId);
      
      // First check if user exists in papeis_usuarios for this event
      const { data: userRoles, error: userRolesError } = await supabase
        .from('papeis_usuarios')
        .select('*')
        .eq('usuario_id', userId)
        .eq('evento_id', eventId);
      
      console.log('Direct papeis_usuarios query:', { userRoles, userRolesError });
      
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
      
      return {
        userRoles: userRoles || [],
        registration: registration || [],
        availableProfiles: allProfiles || [],
        hasRoles: (userRoles || []).length > 0,
        isRegistered: (registration || []).length > 0
      };
    },
    enabled: !!userId && !!eventId,
  });
};