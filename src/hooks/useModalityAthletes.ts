
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export const useModalityAthletes = (modalidadeRepId?: string) => {
  const { currentEventId } = useAuth();
  
  return useQuery({
    queryKey: ['modality-athletes', modalidadeRepId, currentEventId],
    queryFn: async () => {
      if (!modalidadeRepId || !currentEventId) return [];
      
      console.log('Fetching athletes for modality rep:', modalidadeRepId);
      console.log('Current event ID:', currentEventId);
      
      // Primeiro buscar a modalidade e filial do representante
      const { data: repData, error: repError } = await supabase
        .from('modalidade_representantes')
        .select('modalidade_id, filial_id')
        .eq('id', modalidadeRepId)
        .single();

      if (repError) {
        console.error('Error fetching representative data:', repError);
        throw repError;
      }

      console.log('Representative data:', repData);

      // Buscar atletas inscritos na modalidade
      const { data: inscricoesData, error: inscricoesError } = await supabase
        .from('inscricoes_modalidades')
        .select(`
          atleta_id,
          usuarios!inscricoes_modalidades_atleta_id_fkey (
            id,
            nome_completo,
            email
          )
        `)
        .eq('modalidade_id', repData.modalidade_id)
        .eq('evento_id', currentEventId)
        .eq('status', 'confirmado');

      if (inscricoesError) {
        console.error('Error fetching modality athletes:', inscricoesError);
        throw inscricoesError;
      }

      if (!inscricoesData || inscricoesData.length === 0) {
        console.log('No athletes found for this modality');
        return [];
      }

      // Buscar dados de pagamento separadamente usando atleta_id
      const atletaIds = inscricoesData.map(item => item.atleta_id);
      const { data: pagamentosData } = await supabase
        .from('pagamentos')
        .select('atleta_id, numero_identificador')
        .in('atleta_id', atletaIds)
        .eq('evento_id', currentEventId);

      const athletes = inscricoesData.map(item => {
        const usuario = Array.isArray(item.usuarios) ? item.usuarios[0] : item.usuarios;
        const pagamento = pagamentosData?.find(p => p.atleta_id === item.atleta_id);
        
        return {
          id: usuario.id,
          nome_completo: usuario.nome_completo,
          email: usuario.email,
          numero_identificador: pagamento?.numero_identificador || null,
        };
      });

      console.log('Modality athletes found:', athletes.length);
      return athletes;
    },
    enabled: !!modalidadeRepId && !!currentEventId,
  });
};
