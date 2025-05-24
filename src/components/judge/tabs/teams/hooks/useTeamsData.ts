
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { TeamData, ModalityOption } from '../types';

export function useTeamsData(
  eventId: string | null, 
  selectedModalityId: number | null, 
  isOrganizer: boolean,
  modalities: ModalityOption[]
) {
  const { user } = useAuth();
  const branchId = user?.filial_id;

  return useQuery({
    queryKey: ['teams-data', eventId, selectedModalityId, branchId, isOrganizer],
    queryFn: async () => {
      if (!eventId || !selectedModalityId) return [];

      let query = supabase
        .from('equipes')
        .select(`
          id,
          nome,
          modalidade_id,
          evento_id,
          created_by
        `)
        .eq('evento_id', eventId)
        .eq('modalidade_id', selectedModalityId);

      if (!isOrganizer && branchId) {
        query = query.eq('created_by', user?.id);
      }

      const { data: teamsData, error } = await query;
      if (error) throw error;

      if (!teamsData) return [];

      // Get modality info
      const modalityInfo = modalities.find(m => m.id === selectedModalityId);

      // Process teams with athletes
      const processedTeams: TeamData[] = [];
      
      for (const team of teamsData) {
        // Get team athletes
        const { data: athletesData } = await supabase
          .from('atletas_equipes')
          .select(`
            id,
            atleta_id,
            posicao,
            raia,
            usuarios!inner(
              nome_completo,
              tipo_documento,
              numero_documento
            )
          `)
          .eq('equipe_id', team.id);

        const atletas = athletesData?.map(athlete => ({
          id: athlete.id,
          atleta_id: athlete.atleta_id,
          atleta_nome: athlete.usuarios[0]?.nome_completo || '',
          posicao: athlete.posicao || 0,
          raia: athlete.raia,
          documento: `${athlete.usuarios[0]?.tipo_documento || ''}: ${athlete.usuarios[0]?.numero_documento || ''}`
        })) || [];

        processedTeams.push({
          id: team.id,
          nome: team.nome,
          modalidade_id: team.modalidade_id,
          filial_id: branchId || '',
          evento_id: team.evento_id,
          modalidade_info: modalityInfo,
          atletas
        });
      }

      return processedTeams;
    },
    enabled: !!eventId && !!selectedModalityId,
  });
}
