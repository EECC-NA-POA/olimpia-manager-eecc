
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Event } from "@/lib/types/database";

interface Modality {
  id: number;
  nome: string;
  categoria: string;
  tipo_modalidade: string;
  faixa_etaria: string;
  limite_vagas: number;
  vagas_ocupadas: number;
}

interface EventWithExtras extends Event {
  modalidades: Modality[];
  isRegistered: boolean;
  roles: Array<{
    nome: string;
  }>;
  isOpen: boolean;
  isAdmin: boolean;
}

interface BranchEventResponse {
  evento_id: string;
  eventos: {
    id: string;
    nome: string;
    descricao: string;
    data_inicio_inscricao: string;
    data_fim_inscricao: string;
    foto_evento: string | null;
    tipo: 'estadual' | 'nacional' | 'internacional' | 'regional';
    created_at: string | null;
    updated_at: string | null;
    status_evento: 'ativo' | 'encerrado' | 'suspenso';
    modalidades: Modality[];
  };
}

export const useEventQuery = (userId: string | undefined) => {
  return useQuery<EventWithExtras[]>({
    queryKey: ['active-events', userId],
    queryFn: async () => {
      if (!userId) {
        console.log('No user ID provided');
        return [];
      }

      // First get the user's branch ID
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('filial_id')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error fetching user branch:', userError);
        throw userError;
      }

      if (!userData?.filial_id) {
        console.log('User has no branch assigned');
        return [];
      }

      // Get all events where the user's branch is permitted
      const { data: branchEvents, error: branchEventsError } = await supabase
        .from('eventos_filiais')
        .select(`
          evento_id,
          eventos (
            id,
            nome,
            descricao,
            data_inicio_inscricao,
            data_fim_inscricao,
            foto_evento,
            tipo,
            created_at,
            updated_at,
            status_evento,
            modalidades (
              id,
              nome,
              categoria,
              tipo_modalidade,
              faixa_etaria,
              limite_vagas,
              vagas_ocupadas
            )
          )
        `)
        .eq('filial_id', userData.filial_id);

      if (branchEventsError) {
        console.error('Error fetching branch events:', branchEventsError);
        throw branchEventsError;
      }

      // Get user's registered events
      const { data: registeredEvents, error: registeredError } = await supabase
        .from('inscricoes_eventos')
        .select('evento_id')
        .eq('usuario_id', userId);

      if (registeredError) {
        console.error('Error fetching registered events:', registeredError);
        throw registeredError;
      }

      // Get user's roles for each event
      const { data: userRoles, error: rolesError } = await supabase
        .from('papeis_usuarios')
        .select(`
          evento_id,
          perfil_id,
          perfis:perfil_id (
            nome
          )
        `)
        .eq('usuario_id', userId);

      if (rolesError) {
        console.error('Error fetching user roles:', rolesError);
        throw rolesError;
      }

      const typedBranchEvents = branchEvents as BranchEventResponse[];

      // Process and filter events
      const events = typedBranchEvents
        .filter(be => be.eventos !== null)
        .map(be => {
          const event = be.eventos;
          const isRegistered = registeredEvents?.some(reg => reg.evento_id === event.id) || false;
          const eventRoles = (userRoles || [])
            .filter(role => role.evento_id === be.evento_id)
            .map(role => ({
              nome: role.perfis?.nome || ''
            }));

          const isAdmin = eventRoles.some(role => role.nome === 'Administrador');
          const isOpen = event.status_evento === 'ativo';

          return {
            ...event,
            modalidades: event.modalidades || [],
            isRegistered,
            roles: eventRoles,
            isOpen,
            isAdmin
          };
        })
        .filter(event => 
          event.status_evento === 'ativo' || 
          (event.isRegistered && ['encerrado', 'suspenso'].includes(event.status_evento))
        );

      return events;
    },
    enabled: !!userId
  });
};
