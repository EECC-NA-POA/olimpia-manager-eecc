import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useEffect } from 'react';

export const useEventQuery = (userId: string | undefined, enabled: boolean = true) => {
  // Only fetch events if userId is provided and privacy policy is accepted (enabled)
  const query = useQuery({
    queryKey: ['events', userId],
    queryFn: async () => {
      if (!userId) {
        return [];
      }

      try {
        console.log('Fetching events for user:', userId);
        
        // Get all events
        const { data: events, error } = await supabase
          .from('eventos')
          .select('*')
          .order('data_inicio_inscricao', { ascending: false });

        if (error) {
          console.error('Error fetching events:', error);
          throw error;
        }

        if (!events || events.length === 0) {
          console.log('No events found');
          return [];
        }

        console.log('Events found:', events.length);
        
        // First, get user registrations from inscricoes_eventos table
        console.log('Fetching user registrations for userId:', userId, 'Type:', typeof userId);
        
        // Test direct query without RLS first
        const { data: testRegistrations, error: testError } = await supabase
          .rpc('get_user_registrations_debug', { user_id: userId });
        
        console.log('Test RPC query result:', { testRegistrations, testError });
        
        const { data: registrations, error: regError } = await supabase
          .from('inscricoes_eventos')
          .select('evento_id, usuario_id, data_inscricao')
          .eq('usuario_id', userId);
        
        console.log('Registrations query result:', { 
          registrations, 
          regError, 
          userId,
          userIdType: typeof userId,
          registrationsCount: registrations?.length || 0
        });
        
        if (regError) {
          console.error('Error fetching user registrations from inscricoes_eventos table:', regError);
          console.error('RLS Error details:', regError.message, regError.details, regError.hint);
          // Continue with events but mark them as not registered
          return events.map(event => ({
            ...event,
            isRegistered: false
          }));
        }
        
        // Get user branch ID to check for branch permissions
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('filial_id')
          .eq('id', userId)
          .single();
          
        if (userError) {
          console.error('Error fetching user branch:', userError);
        }
        
        const userBranchId = userData?.filial_id;
        console.log('User branch ID:', userBranchId);
        
        // Get branch permissions for events if we have a branch ID
        let branchPermissions = [];
        if (userBranchId) {
          const { data: permissions, error: permError } = await supabase
            .from('eventos_filiais')
            .select('evento_id')
            .eq('filial_id', userBranchId);
            
          if (permError) {
            console.error('Error fetching branch permissions:', permError);
          } else {
            branchPermissions = permissions || [];
            console.log('Branch permissions:', branchPermissions);
          }
        }
        
        // If we have registrations, mark events as registered
        if (registrations && registrations.length > 0) {
          console.log('User registrations found:', registrations);
          const registeredEventIds = registrations.map(reg => reg.evento_id);
          console.log('User registered in events:', registeredEventIds);
          
          // Add isRegistered flag to each event and check branch permission
          return events.map(event => {
            // Check if user is registered in this event
            const isRegistered = registeredEventIds.includes(event.id);
            
            // Check if user's branch has permission for this event
            const hasBranchPermission = !userBranchId || 
              branchPermissions.some(perm => perm.evento_id === event.id);
            
            return {
              ...event,
              isRegistered,
              hasBranchPermission
            };
          });
        }
        
        // If no registrations found, return events with isRegistered = false
        // But still include branch permission info
        return events.map(event => {
          const hasBranchPermission = !userBranchId || 
            branchPermissions.some(perm => perm.evento_id === event.id);
            
          return {
            ...event,
            isRegistered: false,
            hasBranchPermission
          };
        });
      } catch (error: any) {
        console.error('Error in useEventQuery:', error);
        toast.error('Erro ao carregar eventos');
        return [];
      }
    },
    enabled: !!userId && enabled,
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60, // 1 minute
    meta: {
      onSuccess: (data: any[]) => {
        console.log(`Successfully fetched ${data.length} events`);
      }
    }
  });

  // Listen for custom event to refetch when a new event is created
  useEffect(() => {
    const handleEventCreated = () => {
      console.log('Event created, refreshing events list...');
      query.refetch();
    };

    window.addEventListener('eventCreated', handleEventCreated);
    return () => window.removeEventListener('eventCreated', handleEventCreated);
  }, [query.refetch]);

  return {
    ...query,
    refetch: query.refetch
  };
};
