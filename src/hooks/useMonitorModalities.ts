
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface MonitorModality {
  id: string;
  modalidade_id: number;
  filial_id: string;
  evento_id: string;
  atleta_id: string;
  modalidades: {
    nome: string;
    categoria: string;
    tipo_modalidade: string;
  };
  filiais: {
    nome: string;
  };
}

export const useMonitorModalities = () => {
  const { user, currentEventId } = useAuth();
  
  return useQuery({
    queryKey: ['monitor-modalities', user?.id, currentEventId],
    queryFn: async () => {
      if (!user?.id || !currentEventId) {
        console.log('No user ID or event ID available');
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
          modalidades!inner (
            nome,
            categoria,
            tipo_modalidade
          ),
          filiais!inner (
            nome
          )
        `)
        .eq('atleta_id', user.id)
        .eq('evento_id', currentEventId);

      if (error) {
        console.error('Error fetching monitor modalities:', error);
        throw error;
      }

      console.log('Monitor modalities data:', data);
      return data as MonitorModality[];
    },
    enabled: !!user?.id && !!currentEventId,
  });
};
