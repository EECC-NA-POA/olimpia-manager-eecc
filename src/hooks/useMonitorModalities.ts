
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface MonitorModality {
  id: string;
  modalidade_id: number;
  filial_id: string;
  evento_id: string;
  atleta_id: string;
  criado_em: string;
  modalidades: {
    nome: string;
    categoria: string;
    tipo_modalidade: string;
  };
  filiais: {
    nome: string;
    cidade: string;
    estado: string;
  };
}

export const useMonitorModalities = () => {
  const { user, currentEventId } = useAuth();
  
  return useQuery({
    queryKey: ['monitor-modalities', user?.id, currentEventId],
    queryFn: async () => {
      if (!user?.id || !currentEventId) {
        console.log('No user ID or event ID available:', { userId: user?.id, eventId: currentEventId });
        return [];
      }

      console.log('Fetching monitor modalities for user:', user.id, 'event:', currentEventId);

      const { data, error } = await supabase
        .from('modalidade_representantes')
        .select(`
          id,
          modalidade_id,
          filial_id,
          evento_id,
          atleta_id,
          criado_em,
          modalidades!modalidade_representantes_modalidade_id_fkey (
            nome,
            categoria,
            tipo_modalidade
          ),
          filiais!modalidade_representantes_filial_id_fkey (
            nome,
            cidade,
            estado
          )
        `)
        .eq('atleta_id', user.id)
        .eq('evento_id', currentEventId);

      if (error) {
        console.error('Error fetching monitor modalities:', error);
        throw error;
      }

      console.log('Raw monitor modalities data:', data);
      
      if (!data || data.length === 0) {
        console.log('No modalities found for this user and event');
        return [];
      }
      
      // Transform the data to match our interface
      const transformedData = data.map(item => ({
        ...item,
        modalidades: Array.isArray(item.modalidades) ? item.modalidades[0] : item.modalidades,
        filiais: Array.isArray(item.filiais) ? item.filiais[0] : item.filiais
      }));

      console.log('Transformed monitor modalities:', transformedData);
      return transformedData as MonitorModality[];
    },
    enabled: !!user?.id && !!currentEventId,
  });
};
