
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useModeloConfigurationData(eventId: string | null) {
  const { data: modelos = [], isLoading, refetch } = useQuery({
    queryKey: ['modelo-configurations', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      
      console.log('Fetching modelo configurations for event:', eventId);
      
      // First get modalidades for this event, ordered alphabetically
      const { data: modalidades, error: modalidadesError } = await supabase
        .from('modalidades')
        .select('id, nome')
        .eq('evento_id', eventId)
        .order('nome'); // Order alphabetically by nome
      
      if (modalidadesError) {
        console.error('Error fetching modalidades:', modalidadesError);
        throw modalidadesError;
      }
      
      console.log('Found modalidades:', modalidades);
      
      if (!modalidades || modalidades.length === 0) {
        console.log('No modalidades found for event');
        return [];
      }
      
      const modalidadeIds = modalidades.map(m => m.id);
      console.log('Searching for modelos with modalidade_ids:', modalidadeIds);
      
      // Get modelos_modalidade data
      const { data: modelosData, error: modelosError } = await supabase
        .from('modelos_modalidade')
        .select(`
          id,
          modalidade_id,
          codigo_modelo,
          descricao
        `)
        .in('modalidade_id', modalidadeIds);

      if (modelosError) {
        console.error('Error fetching modelos:', modelosError);
        throw modelosError;
      }

      console.log('Raw modelos data:', modelosData);
      
      if (!modelosData || modelosData.length === 0) {
        console.log('No modelos found for modalidades');
        return [];
      }

      // For each modelo, get its campos_modelo to build parametros
      const enrichedModelos = await Promise.all(
        modelosData.map(async (modelo) => {
          const { data: campos, error: camposError } = await supabase
            .from('campos_modelo')
            .select('chave_campo, metadados')
            .eq('modelo_id', modelo.id);

          if (camposError) {
            console.error('Error fetching campos for modelo:', modelo.id, camposError);
          }

          // Build parametros from campos metadados
          const parametros: any = {};
          if (campos) {
            campos.forEach(campo => {
              if (campo.metadados) {
                // Merge metadados into parametros
                Object.assign(parametros, campo.metadados);
              }
            });
          }

          // Add some default structure if no campos exist
          if (Object.keys(parametros).length === 0) {
            parametros.baterias = false;
            parametros.regra_tipo = 'pontos';
          }

          const modalidade = modalidades.find(m => m.id === modelo.modalidade_id);
          
          return {
            ...modelo,
            parametros,
            modalidade: {
              nome: modalidade?.nome || 'Modalidade não encontrada'
            }
          };
        })
      );

      // Sort the enriched modelos by modalidade name to maintain alphabetical order
      const sortedModelos = enrichedModelos.sort((a, b) => 
        a.modalidade.nome.localeCompare(b.modalidade.nome)
      );

      console.log('Enriched and sorted modelos data:', sortedModelos);
      return sortedModelos;
    },
    enabled: !!eventId,
  });

  return { modelos, isLoading, refetch };
}
