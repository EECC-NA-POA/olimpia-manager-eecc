
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
        .select('id, nome, categoria')
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
          console.log('Fetching campos for modelo ID:', modelo.id);
          
          const { data: campos, error: camposError } = await supabase
            .from('campos_modelo')
            .select('*')
            .eq('modelo_id', modelo.id)
            .order('ordem_exibicao');

          if (camposError) {
            console.error('Error fetching campos for modelo:', modelo.id, camposError);
          }

          console.log('Found campos for modelo', modelo.id, ':', campos);

          // Build parametros from campos
          const parametros: any = {};
          const camposArray: any[] = [];
          
          if (campos && campos.length > 0) {
            campos.forEach(campo => {
              // Add campo to campos array for form editing
              camposArray.push({
                id: campo.id,
                chave_campo: campo.chave_campo,
                rotulo_campo: campo.rotulo_campo,
                tipo_input: campo.tipo_input,
                obrigatorio: campo.obrigatorio,
                ordem_exibicao: campo.ordem_exibicao,
                metadados: campo.metadados || {}
              });

              // Extract special configuration fields from metadados
              if (campo.chave_campo === 'baterias' && campo.metadados) {
                parametros.baterias = campo.metadados.baterias || false;
                parametros.num_raias = campo.metadados.num_raias || 8;
                parametros.permite_final = campo.metadados.permite_final || false;
              }
              
              if (campo.chave_campo === 'pontuacao' && campo.metadados) {
                parametros.regra_tipo = campo.metadados.regra_tipo;
                parametros.formato_resultado = campo.metadados.formato_resultado;
                parametros.tipo_calculo = campo.metadados.tipo_calculo;
                parametros.campo_referencia = campo.metadados.campo_referencia;
                parametros.contexto = campo.metadados.contexto;
                parametros.ordem_calculo = campo.metadados.ordem_calculo;
              }

              // Extract other metadados into parametros
              if (campo.metadados) {
                Object.keys(campo.metadados).forEach(key => {
                  if (!parametros.hasOwnProperty(key)) {
                    parametros[key] = campo.metadados[key];
                  }
                });
              }
            });
          }

          // Add campos array to parametros for editing
          parametros.campos = camposArray;

          // Add some default structure if no campos exist
          if (Object.keys(parametros).length === 0 || !parametros.regra_tipo) {
            parametros.baterias = false;
            parametros.regra_tipo = 'pontos';
            parametros.campos = [];
          }

          const modalidade = modalidades.find(m => m.id === modelo.modalidade_id);
          
          const enrichedModelo = {
            ...modelo,
            parametros,
            modalidade: {
              nome: modalidade?.nome || 'Modalidade não encontrada',
              categoria: modalidade?.categoria || null
            }
          };

          console.log('Enriched modelo:', enrichedModelo);
          return enrichedModelo;
        })
      );

      // Sort the enriched modelos by modalidade name to maintain alphabetical order
      const sortedModelos = enrichedModelos.sort((a, b) => 
        a.modalidade.nome.localeCompare(b.modalidade.nome)
      );

      console.log('Final enriched and sorted modelos data:', sortedModelos);
      return sortedModelos;
    },
    enabled: !!eventId,
  });

  return { modelos, isLoading, refetch };
}
