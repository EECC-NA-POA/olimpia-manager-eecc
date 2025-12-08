import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface AvailableModality {
  id: number;
  nome: string;
  categoria: string | null;
  tipo_modalidade: string;
  limite_vagas: number | null;
  vagas_ocupadas: number;
}

export function useAvailableModalitiesForAthlete(userId: string | undefined, eventId: string | null) {
  return useQuery({
    queryKey: ['available-modalities-athlete', userId, eventId],
    queryFn: async (): Promise<AvailableModality[]> => {
      if (!userId || !eventId) return [];

      console.log('Fetching available modalities for athlete:', userId, 'event:', eventId);

      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

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

      // Get modalities linked to non-recurring activities with past dates
      const { data: pastActivities, error: pastError } = await supabase
        .from('cronograma_atividade_modalidades')
        .select(`
          modalidade_id,
          cronograma_atividades!inner (
            dia,
            recorrente,
            evento_id
          )
        `)
        .eq('cronograma_atividades.evento_id', eventId)
        .eq('cronograma_atividades.recorrente', false)
        .lt('cronograma_atividades.dia', today);

      if (pastError) {
        console.error('Error fetching past activities:', pastError);
        // Don't throw, just continue without this filter
      }

      const expiredModalityIds = pastActivities?.map(a => a.modalidade_id) || [];
      console.log('Expired modality IDs (past non-recurring activities):', expiredModalityIds);

      // Then fetch all modalities for the event
      const { data: modalitiesData, error: modalitiesError } = await supabase
        .from('modalidades')
        .select(`
          id,
          nome,
          categoria,
          tipo_modalidade,
          limite_vagas,
          vagas_ocupadas
        `)
        .eq('evento_id', eventId)
        .order('nome');

      if (modalitiesError) {
        console.error('Error fetching modalities:', modalitiesError);
        throw modalitiesError;
      }

      // Filter out modalities already registered AND modalities with past activities
      const availableModalities = (modalitiesData || []).filter(
        m => !registeredIds.includes(m.id) && !expiredModalityIds.includes(m.id)
      );

      console.log('Available modalities after filtering:', availableModalities.length);
      return availableModalities;
    },
    enabled: !!userId && !!eventId,
  });
}
