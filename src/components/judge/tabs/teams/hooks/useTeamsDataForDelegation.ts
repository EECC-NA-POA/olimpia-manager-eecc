
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { TeamData } from '../types';

export function useTeamsDataForDelegation(
  eventId: string | null,
  modalityId: number | null,
  branchId?: string | null
) {
  return useQuery({
    queryKey: ['teams-delegation', eventId, modalityId, branchId],
    queryFn: async (): Promise<TeamData[]> => {
      if (!eventId || !modalityId) return [];

      console.log('Fetching teams for delegation:', { eventId, modalityId, branchId });

      // Get teams for the specific modality (similar to organizer approach)
      const { data: teamsData, error: teamsError } = await supabase
        .from('equipes')
        .select(`
          id,
          nome,
          modalidade_id,
          evento_id,
          created_by,
          modalidades(
            nome,
            categoria,
            tipo_pontuacao
          )
        `)
        .eq('evento_id', eventId)
        .eq('modalidade_id', modalityId);

      if (teamsError) {
        console.error('Error fetching teams:', teamsError);
        throw new Error('Não foi possível carregar as equipes');
      }

      if (!teamsData || teamsData.length === 0) return [];

      console.log('Found teams for modality:', teamsData.length, teamsData.map(t => t.nome));

      // Process each team to get athletes (following organizer pattern)
      const processedTeams: TeamData[] = [];
      
      for (const team of teamsData) {
        console.log(`Processing team: ${team.nome} (ID: ${team.id})`);
        
        // Get athletes for this team
        const { data: athletesData, error: athletesError } = await supabase
          .from('atletas_equipes')
          .select(`
            id,
            atleta_id,
            usuarios(
              nome_completo,
              tipo_documento,
              numero_documento,
              filial_id,
              filiais(nome)
            )
          `)
          .eq('equipe_id', team.id);

        if (athletesError) {
          console.error('Error fetching team athletes:', athletesError);
          // Continue with empty athletes array instead of failing
        }

        console.log(`Athletes data for team ${team.nome}:`, athletesData);

        // Transform athletes data (similar to organizer approach)
        const atletas = (athletesData || []).map((athlete: any) => {
          const usuario = athlete.usuarios;
          const filial = usuario?.filiais;

          return {
            id: athlete.id,
            atleta_id: athlete.atleta_id,
            atleta_nome: usuario?.nome_completo || '',
            documento: `${usuario?.tipo_documento || ''}: ${usuario?.numero_documento || ''}`,
            posicao: 1, // Default position
            raia: undefined,
            filial_nome: filial?.nome || 'N/A'
          };
        });

        console.log(`Team ${team.nome} final athletes:`, atletas.length, atletas.map(a => a.atleta_nome));

        const modalidade = team.modalidades as any;

        processedTeams.push({
          id: team.id,
          nome: team.nome,
          modalidade_id: team.modalidade_id,
          filial_id: branchId || '',
          evento_id: team.evento_id,
          modalidade_info: {
            id: team.modalidade_id,
            nome: modalidade?.nome || '',
            categoria: modalidade?.categoria || '',
            tipo_modalidade: 'coletiva' as 'individual' | 'coletiva'
          },
          atletas
        });
      }

      console.log('Final teams with athletes:', processedTeams.map(t => ({
        nome: t.nome,
        atletas: t.atletas.length
      })));

      return processedTeams;
    },
    enabled: !!eventId && !!modalityId,
  });
}
