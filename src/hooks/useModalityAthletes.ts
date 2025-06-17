
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

      // Buscar atletas inscritos na modalidade usando o evento atual
      const { data, error } = await supabase
        .from('inscricoes_modalidades')
        .select(`
          atleta_id,
          usuarios!inner (
            id,
            nome_completo,
            email
          ),
          pagamentos!left (
            numero_identificador
          )
        `)
        .eq('modalidade_id', repData.modalidade_id)
        .eq('evento_id', currentEventId)
        .eq('status', 'confirmado')
        .eq('pagamentos.evento_id', currentEventId);

      if (error) {
        console.error('Error fetching modality athletes:', error);
        throw error;
      }

      const athletes = data?.map(item => {
        const usuario = Array.isArray(item.usuarios) ? item.usuarios[0] : item.usuarios;
        const pagamento = Array.isArray(item.pagamentos) ? item.pagamentos[0] : item.pagamentos;
        return {
          id: usuario.id,
          nome_completo: usuario.nome_completo,
          email: usuario.email,
          numero_identificador: pagamento?.numero_identificador || null,
        };
      }) || [];

      console.log('Modality athletes found:', athletes.length);
      return athletes;
    },
    enabled: !!modalidadeRepId && !!currentEventId,
  });
};
