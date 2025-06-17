
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

      // Step 5: Try a simplified query approach
      console.log('=== STEP 5: Simplified query approach ===');
      
      // First get the representative records for this user
      const { data: userReps, error: userRepsError } = await supabase
        .from('modalidade_representantes')
        .select('*')
        .eq('atleta_id', user.id);

      if (userRepsError) {
        console.error('Error fetching user representatives:', userRepsError);
        throw userRepsError;
      }

      console.log('User representatives:', userReps);

      if (!userReps || userReps.length === 0) {
        console.log('No representatives found for user');
        return [];
      }

      // Now get the modalities and filiais data separately
      const modalityIds = userReps.map(rep => rep.modalidade_id);
      const filialIds = userReps.map(rep => rep.filial_id);

      console.log('Fetching modalidades with IDs:', modalityIds);
      const { data: modalidades, error: modalidadesError } = await supabase
        .from('modalidades')
        .select('id, nome, categoria, evento_id')
        .in('id', modalityIds)
        .eq('evento_id', currentEventId); // Filter by current event

      if (modalidadesError) {
        console.error('Error fetching modalidades:', modalidadesError);
        throw modalidadesError;
      }

      console.log('Fetched modalidades:', modalidades);

      console.log('Fetching filiais with IDs:', filialIds);
      const { data: filiaisData, error: filiaisDataError } = await supabase
        .from('filiais')
        .select('id, nome, cidade, estado')
        .in('id', filialIds);

      if (filiaisDataError) {
        console.error('Error fetching filiais:', filiaisDataError);
        throw filiaisDataError;
      }

      console.log('Fetched filiais:', filiaisData);

      // Step 6: Combine the data
      console.log('=== STEP 6: Combining data ===');
      const combinedData = userReps
        .map(rep => {
          const modalidade = modalidades?.find(mod => mod.id === rep.modalidade_id);
          const filial = filiaisData?.find(fil => fil.id === rep.filial_id);
          
          console.log(`Processing rep ${rep.id}:`, {
            rep,
            modalidade,
            filial,
            hasModalidade: !!modalidade,
            hasFilial: !!filial
          });

          if (!modalidade || !filial) {
            console.log(`Skipping rep ${rep.id} - missing modalidade or filial`);
            return null;
          }

          return {
            ...rep,
            modalidades: {
              id: modalidade.id,
              nome: modalidade.nome,
              categoria: modalidade.categoria
            },
            filiais: {
              id: filial.id,
              nome: filial.nome,
              cidade: filial.cidade,
              estado: filial.estado
            }
          };
        })
        .filter(Boolean) as MonitorModality[];

      console.log('=== FINAL RESULT ===');
      console.log('Final combined data:', combinedData);
      console.log('Total records:', combinedData.length);
      
      return combinedData;
    },
    enabled: !!user?.id && !!currentEventId,
  });
};
