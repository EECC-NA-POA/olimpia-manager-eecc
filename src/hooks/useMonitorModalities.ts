
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface MonitorModality {
  id: string;
  atleta_id: string;
  modalidade_id: number;
  filial_id: string;
  criado_em: string;
  atualizado_em: string | null;
  modalidades: {
    id: number;
    nome: string;
    categoria: string;
  };
  filiais: {
    id: string;
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
      if (!user?.id) {
        console.log('useMonitorModalities - No user ID available');
        return [];
      }
      
      if (!currentEventId) {
        console.log('useMonitorModalities - No current event ID available');
        return [];
      }
      
      console.log('useMonitorModalities - Fetching monitor modalities for user:', user.id);
      console.log('useMonitorModalities - Current event ID:', currentEventId);
      
      // First, let's check if the user exists in modalidade_representantes
      const { data: checkData, error: checkError } = await supabase
        .from('modalidade_representantes')
        .select('*')
        .eq('atleta_id', user.id);

      console.log('useMonitorModalities - Raw modalidade_representantes check:', checkData);
      console.log('useMonitorModalities - Check error:', checkError);

      // Now let's get the full data with joins
      const { data, error } = await supabase
        .from('modalidade_representantes')
        .select(`
          id,
          atleta_id,
          modalidade_id,
          filial_id,
          criado_em,
          atualizado_em,
          modalidades!inner (
            id,
            nome,
            categoria,
            evento_id
          ),
          filiais!inner (
            id,
            nome,
            cidade,
            estado
          )
        `)
        .eq('atleta_id', user.id)
        .eq('modalidades.evento_id', currentEventId);

      if (error) {
        console.error('useMonitorModalities - Error fetching monitor modalities:', error);
        throw error;
      }

      console.log('useMonitorModalities - Monitor modalities data with joins:', data);
      
      // Transform the data to match our interface since Supabase returns nested objects as arrays
      const transformedData = data?.map(item => {
        console.log('useMonitorModalities - Transforming item:', item);
        return {
          ...item,
          modalidades: Array.isArray(item.modalidades) ? item.modalidades[0] : item.modalidades,
          filiais: Array.isArray(item.filiais) ? item.filiais[0] : item.filiais
        };
      }) || [];

      console.log('useMonitorModalities - Final transformed data:', transformedData);
      return transformedData as MonitorModality[];
    },
    enabled: !!user?.id && !!currentEventId,
  });
};
