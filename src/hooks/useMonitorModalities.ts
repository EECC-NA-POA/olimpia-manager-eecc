
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface MonitorModality {
  id: number;
  usuario_id: string;
  modalidade_id: number;
  filial_id: number;
  evento_id: string;
  created_at: string;
  modalidades: {
    id: number;
    nome: string;
    categoria: string;
  };
  filiais: {
    id: number;
    nome: string;
    cidade: string;
    estado: string;
  };
}

export const useMonitorModalities = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['monitor-modalities', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log('Fetching monitor modalities for user:', user.id);
      
      const { data, error } = await supabase
        .from('modalidade_representantes')
        .select(`
          id,
          usuario_id,
          modalidade_id,
          filial_id,
          evento_id,
          created_at,
          modalidades!inner (
            id,
            nome,
            categoria
          ),
          filiais!inner (
            id,
            nome,
            cidade,
            estado
          )
        `)
        .eq('usuario_id', user.id);

      if (error) {
        console.error('Error fetching monitor modalities:', error);
        throw error;
      }

      console.log('Monitor modalities data:', data);
      
      // Transform the data to match our interface since Supabase returns nested objects as arrays
      const transformedData = data?.map(item => ({
        ...item,
        modalidades: Array.isArray(item.modalidades) ? item.modalidades[0] : item.modalidades,
        filiais: Array.isArray(item.filiais) ? item.filiais[0] : item.filiais
      })) || [];

      return transformedData as MonitorModality[];
    },
    enabled: !!user?.id,
  });
};
