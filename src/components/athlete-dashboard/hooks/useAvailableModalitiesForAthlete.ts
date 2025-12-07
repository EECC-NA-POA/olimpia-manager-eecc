import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface AvailableModality {
  id: number;
  nome: string;
  categoria: string | null;
  tipo_modalidade: string;
  descricao: string | null;
  limite_vagas: number | null;
  vagas_ocupadas: number;
  valor_inscricao: number | null;
  data_limite_inscricao: string | null;
}

export function useAvailableModalitiesForAthlete(userId: string | undefined, eventId: string | null) {
  return useQuery({
    queryKey: ['available-modalities-athlete', userId, eventId],
    queryFn: async (): Promise<AvailableModality[]> => {
      if (!userId || !eventId) return [];

      console.log('Fetching available modalities for athlete:', userId, 'event:', eventId);

      // First, get the modalities the athlete is already registered for
      const { data: registeredData, error: registeredError } = await supabase
        .from('inscricoes_modalidades')
        .select('modalidade_id')
        .eq('atleta_id', userId)
        .eq('evento_id', eventId);

      if (registeredError) {
        console.error('Error fetching registered modalities:', registeredError);
        throw registeredError;
      }

      const registeredIds = registeredData?.map(r => r.modalidade_id) || [];

      // Then fetch all modalities for the event
      const { data: modalitiesData, error: modalitiesError } = await supabase
        .from('modalidades')
        .select(`
          id,
          nome,
          categoria,
          tipo_modalidade,
          descricao,
          limite_vagas,
          vagas_ocupadas,
          valor_inscricao,
          data_limite_inscricao
        `)
        .eq('evento_id', eventId)
        .order('nome');

      if (modalitiesError) {
        console.error('Error fetching modalities:', modalitiesError);
        throw modalitiesError;
      }

      // Filter out modalities the athlete is already registered for
      const availableModalities = (modalitiesData || []).filter(
        m => !registeredIds.includes(m.id)
      );

      console.log('Available modalities:', availableModalities.length);
      return availableModalities;
    },
    enabled: !!userId && !!eventId,
  });
}
