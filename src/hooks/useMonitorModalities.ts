
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
      
      // First, let's check if the user exists in modalidade_representantes without any filters
      console.log('=== STEP 1: Checking user in modalidade_representantes ===');
      const { data: allUserReps, error: allUserError } = await supabase
        .from('modalidade_representantes')
        .select('*')
        .eq('atleta_id', user.id);

      console.log('useMonitorModalities - All user representatives:', allUserReps);
      console.log('useMonitorModalities - Error:', allUserError);

      // Check if modalidades exist for current event
      console.log('=== STEP 2: Checking modalidades for current event ===');
      const { data: eventModalities, error: modalitiesError } = await supabase
        .from('modalidades')
        .select('id, nome, categoria, evento_id')
        .eq('evento_id', currentEventId);

      console.log('useMonitorModalities - Event modalidades:', eventModalities);
      console.log('useMonitorModalities - Modalidades error:', modalitiesError);

      // Try a simpler query first
      console.log('=== STEP 3: Simple query with user filter ===');
      const { data: simpleData, error: simpleError } = await supabase
        .from('modalidade_representantes')
        .select(`
          *,
          modalidades (
            id,
            nome,
            categoria,
            evento_id
          ),
          filiais (
            id,
            nome,
            cidade,
            estado
          )
        `)
        .eq('atleta_id', user.id);

      console.log('useMonitorModalities - Simple query result:', simpleData);
      console.log('useMonitorModalities - Simple query error:', simpleError);

      // Filter by event on the client side for now
      const filteredData = simpleData?.filter(item => {
        console.log('useMonitorModalities - Checking item:', item);
        console.log('useMonitorModalities - Item modalidade evento_id:', item.modalidades?.evento_id);
        console.log('useMonitorModalities - Current event ID:', currentEventId);
        return item.modalidades?.evento_id === currentEventId;
      });

      console.log('useMonitorModalities - Filtered data:', filteredData);

      if (simpleError) {
        console.error('useMonitorModalities - Error in simple query:', simpleError);
        throw simpleError;
      }

      // Transform the data to match our interface
      const transformedData = filteredData?.map(item => {
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
