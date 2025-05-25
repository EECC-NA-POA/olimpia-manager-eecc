
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useTeamsData(eventId: string | null, branchId?: string) {
  return useQuery({
    queryKey: ['teams', eventId, branchId],
    queryFn: async () => {
      if (!eventId || !branchId) return [];
      
      const { data, error } = await supabase
        .from('equipes')
        .select(`
          id,
          nome,
          cor_uniforme,
          observacoes,
          modalidade_id,
          modalidades (
            nome,
            categoria
          )
        `)
        .eq('evento_id', eventId)
        .eq('filial_id', branchId);
      
      if (error) {
        console.error('Error fetching teams:', error);
        throw new Error('Não foi possível carregar as equipes');
      }
      
      // Map the teams to match the expected Team type
      return data?.map(team => {
        // Check if modalidades is an array and extract the first item if so
        const modalidadeData = Array.isArray(team.modalidades) ? team.modalidades[0] : team.modalidades;
        
        return {
          id: team.id,
          nome: team.nome,
          cor_uniforme: team.cor_uniforme,
          observacoes: team.observacoes,
          modalidade_id: team.modalidade_id,
          modalidades: {
            nome: modalidadeData?.nome,
            categoria: modalidadeData?.categoria
          }
        };
      });
    },
    enabled: !!eventId && !!branchId,
  });
}
