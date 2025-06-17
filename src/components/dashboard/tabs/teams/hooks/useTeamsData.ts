
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useTeamsData(eventId: string | null, branchId?: string) {
  return useQuery({
    queryKey: ['teams', eventId, branchId],
    queryFn: async () => {
      if (!eventId) return [];
      
      console.log('Fetching teams for event:', eventId, 'branchId:', branchId);
      
      // First get teams for the event
      let teamsQuery = supabase
        .from('equipes')
        .select(`
          id,
          nome,
          modalidade_id,
          evento_id,
          created_by,
          modalidades (
            nome,
            categoria
          )
        `)
        .eq('evento_id', eventId);

      const { data: teamsData, error } = await teamsQuery;
      
      if (error) {
        console.error('Error fetching teams:', error);
        throw new Error('Não foi possível carregar as equipes');
      }

      if (!teamsData) return [];

      // If branchId is provided, filter teams by checking if the team has athletes from that branch
      let filteredTeams = teamsData;
      
      if (branchId) {
        const filteredTeamsData = [];
        
        for (const team of teamsData) {
          // Check if this team has athletes from the specified branch
          const { data: teamAthletes } = await supabase
            .from('atletas_equipes')
            .select(`
              atleta_id,
              usuarios!inner(filial_id)
            `)
            .eq('equipe_id', team.id);

          // Check if any athlete in this team belongs to the specified branch
          const hasAthleteFromBranch = teamAthletes?.some(athlete => {
            const usuario = Array.isArray(athlete.usuarios) ? athlete.usuarios[0] : athlete.usuarios;
            return usuario?.filial_id === branchId;
          });

          if (hasAthleteFromBranch) {
            filteredTeamsData.push(team);
          }
        }
        
        filteredTeams = filteredTeamsData;
      }

      // Map the teams to match the expected Team type
      return filteredTeams?.map(team => {
        // Check if modalidades is an array and extract the first item if so
        const modalidadeData = Array.isArray(team.modalidades) ? team.modalidades[0] : team.modalidades;
        
        return {
          id: team.id,
          nome: team.nome,
          modalidade_id: team.modalidade_id,
          modalidades: {
            nome: modalidadeData?.nome,
            categoria: modalidadeData?.categoria
          }
        };
      });
    },
    enabled: !!eventId,
  });
}
