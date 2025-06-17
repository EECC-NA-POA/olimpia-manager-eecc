
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

      // Get teams for the specific modality
      const { data: teamsData, error: teamsError } = await supabase
        .from('equipes')
        .select(`
          id,
          nome,
          modalidade_id,
          evento_id,
          created_by,
          modalidades!inner(
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

      // For each team, get its athletes
      const teamsWithAthletes = await Promise.all(
        teamsData.map(async (team) => {
          console.log(`Processing team: ${team.nome} (ID: ${team.id})`);
          
          // Get athletes for this team with proper join to usuarios and filiais
          const { data: athletesData, error: athletesError } = await supabase
            .from('atletas_equipes')
            .select(`
              id,
              atleta_id,
              posicao,
              raia,
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
            return {
              id: team.id,
              nome: team.nome,
              modalidade_id: team.modalidade_id,
              filial_id: branchId || '',
              evento_id: team.evento_id,
              atletas: []
            };
          }

          console.log(`Athletes data raw for team ${team.nome}:`, athletesData);

          // Transform athletes data
          const atletas = (athletesData || []).map(athlete => {
            console.log('Processing athlete data:', athlete);
            
            // Handle usuarios data - it should be a single object due to foreign key
            const usuario = Array.isArray(athlete.usuarios) 
              ? athlete.usuarios[0] 
              : athlete.usuarios;
            
            // Handle filiais data - it should be a single object due to foreign key  
            const filial = usuario?.filiais 
              ? (Array.isArray(usuario.filiais) ? usuario.filiais[0] : usuario.filiais)
              : null;

            console.log(`Processing athlete: ${usuario?.nome_completo} from filial ${usuario?.filial_id}`, {
              usuario,
              filial
            });

            return {
              id: athlete.id,
              atleta_id: athlete.atleta_id,
              atleta_nome: usuario?.nome_completo || '',
              documento: `${usuario?.tipo_documento || ''}: ${usuario?.numero_documento || ''}`,
              posicao: athlete.posicao || 1,
              raia: athlete.raia,
              filial_nome: filial?.nome || 'N/A'
            };
          });

          console.log(`Team ${team.nome} final athletes:`, atletas.length, atletas.map(a => a.atleta_nome));

          const modalidade = Array.isArray(team.modalidades) ? team.modalidades[0] : team.modalidades;

          return {
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
          };
        })
      );

      console.log('Final teams with athletes:', teamsWithAthletes.map(t => ({
        nome: t.nome,
        atletas: t.atletas.length
      })));

      return teamsWithAthletes;
    },
    enabled: !!eventId && !!modalityId,
  });
}
