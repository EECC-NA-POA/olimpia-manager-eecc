
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
      
      console.log('=== DEBUGGING MONITOR MODALITIES QUERY ===');
      console.log('User ID:', user.id);
      console.log('Current Event ID:', currentEventId);
      
      // Step 1: Check what's in modalidade_representantes for this user
      console.log('=== STEP 1: Raw modalidade_representantes data ===');
      const { data: rawReps, error: rawError } = await supabase
        .from('modalidade_representantes')
        .select('*')
        .eq('atleta_id', user.id);

      console.log('Raw representatives data:', rawReps);
      if (rawError) console.error('Raw representatives error:', rawError);

      // Step 2: Check what modalidades exist for this event
      console.log('=== STEP 2: Event modalidades ===');
      const { data: eventMods, error: eventModsError } = await supabase
        .from('modalidades')
        .select('*')
        .eq('evento_id', currentEventId);

      console.log('Event modalidades:', eventMods);
      if (eventModsError) console.error('Event modalidades error:', eventModsError);

      // Step 3: Check what filiais exist
      console.log('=== STEP 3: Filiais ===');
      const { data: filiais, error: filiaisError } = await supabase
        .from('filiais')
        .select('*');

      console.log('All filiais:', filiais);
      if (filiaisError) console.error('Filiais error:', filiaisError);

      // Step 4: Manual join to see what should match
      if (rawReps && eventMods) {
        console.log('=== STEP 4: Manual data matching ===');
        rawReps.forEach(rep => {
          const matchingModality = eventMods.find(mod => mod.id === rep.modalidade_id);
          console.log(`Rep modalidade_id ${rep.modalidade_id} matches event modality:`, matchingModality);
        });
      }

      // Step 5: Try the full query with detailed logging
      console.log('=== STEP 5: Full query with joins ===');
      const { data: fullData, error: fullError } = await supabase
        .from('modalidade_representantes')
        .select(`
          id,
          atleta_id,
          modalidade_id,
          filial_id,
          criado_em,
          atualizado_em,
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

      console.log('Full query result:', fullData);
      console.log('Full query error:', fullError);

      if (fullError) {
        console.error('useMonitorModalities - Error in full query:', fullError);
        throw fullError;
      }

      // Step 6: Filter and transform
      console.log('=== STEP 6: Filtering by event ===');
      const filteredData = fullData?.filter(item => {
        // Fix: Access the first element of the modalidades array
        const modalidade = Array.isArray(item.modalidades) ? item.modalidades[0] : item.modalidades;
        console.log('Checking item for event filter:', {
          item_id: item.id,
          modalidade_id: item.modalidade_id,
          modalidade_evento_id: modalidade?.evento_id,
          current_event_id: currentEventId,
          matches: modalidade?.evento_id === currentEventId
        });
        return modalidade?.evento_id === currentEventId;
      }) || [];

      console.log('Filtered data count:', filteredData.length);
      console.log('Final filtered data:', filteredData);

      // Transform the data to match our interface
      const transformedData = filteredData.map(item => {
        const transformed = {
          ...item,
          modalidades: Array.isArray(item.modalidades) ? item.modalidades[0] : item.modalidades,
          filiais: Array.isArray(item.filiais) ? item.filiais[0] : item.filiais
        };
        console.log('Transformed item:', transformed);
        return transformed;
      });

      console.log('=== FINAL RESULT ===');
      console.log('Final transformed data:', transformedData);
      
      return transformedData as MonitorModality[];
    },
    enabled: !!user?.id && !!currentEventId,
  });
};
