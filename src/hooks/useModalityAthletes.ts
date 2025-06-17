
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const useModalityAthletes = (modalidadeRepId?: string) => {
  return useQuery({
    queryKey: ['modality-athletes', modalidadeRepId],
    queryFn: async () => {
      if (!modalidadeRepId) return [];
      
      console.log('Fetching athletes for modality rep:', modalidadeRepId);
      
      // Primeiro buscar a modalidade e filial do representante
      const { data: repData, error: repError } = await supabase
        .from('modalidade_representantes')
        .select('modalidade_id, filial_id, evento_id')
        .eq('id', modalidadeRepId)
        .single();

      if (repError) {
        console.error('Error fetching representative data:', repError);
        throw repError;
      }

      // Buscar atletas inscritos na modalidade
      const { data, error } = await supabase
        .from('inscricoes_modalidades')
        .select(`
          atleta_id,
          usuarios!inner (
            id,
            nome_completo,
            email,
            numero_identificador
          )
        `)
        .eq('modalidade_id', repData.modalidade_id)
        .eq('evento_id', repData.evento_id)
        .eq('status', 'confirmado');

      if (error) {
        console.error('Error fetching modality athletes:', error);
        throw error;
      }

      const athletes = data?.map(item => {
        const usuario = Array.isArray(item.usuarios) ? item.usuarios[0] : item.usuarios;
        return {
          id: usuario.id,
          nome_completo: usuario.nome_completo,
          email: usuario.email,
          numero_identificador: usuario.numero_identificador,
        };
      }) || [];

      console.log('Modality athletes found:', athletes.length);
      return athletes;
    },
    enabled: !!modalidadeRepId,
  });
};
