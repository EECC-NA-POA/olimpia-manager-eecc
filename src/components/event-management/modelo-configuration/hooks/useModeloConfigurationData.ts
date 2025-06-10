
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
        .order('nome');
      
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
      
      // Get modelos_modalidade data with their campos_modelo in one query
      const { data: modelosData, error: modelosError } = await supabase
        .from('modelos_modalidade')
        .select(`
          id,
          modalidade_id,
          codigo_modelo,
          descricao,
          campos_modelo!inner (
            id,
            chave_campo,
            rotulo_campo,
            tipo_input,
            obrigatorio,
            ordem_exibicao,
            metadados
          )
        `)
        .in('modalidade_id', modalidadeIds);

      if (modelosError) {
        console.error('Error fetching modelos with campos:', modelosError);
        throw modelosError;
      }

      console.log('Raw modelos data with campos:', modelosData);
      
      // Also get modelos without campos to include them in the list
      const { data: modelosWithoutCampos, error: modelosWithoutCamposError } = await supabase
        .from('modelos_modalidade')
        .select('id, modalidade_id, codigo_modelo, descricao')
        .in('modalidade_id', modalidadeIds)
        .not('id', 'in', `(${modelosData?.map(m => m.id).join(',') || '0'})`);

      if (modelosWithoutCamposError) {
        console.error('Error fetching modelos without campos:', modelosWithoutCamposError);
        // Don't throw, just continue with what we have
      }

      // Combine both datasets
      const allModelos = [
        ...(modelosData || []),
        ...(modelosWithoutCampos || []).map(modelo => ({ ...modelo, campos_modelo: [] }))
      ];

      console.log('All modelos combined:', allModelos);

      if (!allModelos || allModelos.length === 0) {
        console.log('No modelos found for modalidades');
        return [];
      }

      // Process each modelo to build the enriched data structure
      const enrichedModelos = allModelos.map((modelo) => {
        console.log('Processing modelo:', modelo.id, modelo.codigo_modelo);
        
        const campos = modelo.campos_modelo || [];
        console.log('Found campos for modelo', modelo.id, ':', campos);

        // Build parametros from campos
        const parametros: any = {
          baterias: false,
          num_raias: 8,
          permite_final: false,
          regra_tipo: 'pontos',
          formato_resultado: '',
          tipo_calculo: '',
          campo_referencia: '',
          contexto: '',
          ordem_calculo: 'asc'
        };
        
        const camposArray: any[] = [];
        
        if (campos && campos.length > 0) {
          campos.forEach(campo => {
            console.log('Processing campo:', campo);
            
            // Handle special configuration fields
            if (campo.chave_campo === 'baterias' && campo.metadados) {
              parametros.baterias = campo.metadados.baterias || false;
              parametros.num_raias = campo.metadados.num_raias || 8;
              parametros.permite_final = campo.metadados.permite_final || false;
              console.log('Found baterias config:', { 
                baterias: parametros.baterias, 
                num_raias: parametros.num_raias, 
                permite_final: parametros.permite_final 
              });
            } else if (campo.chave_campo === 'pontuacao' && campo.metadados) {
              parametros.regra_tipo = campo.metadados.regra_tipo || 'pontos';
              parametros.formato_resultado = campo.metadados.formato_resultado || '';
              parametros.tipo_calculo = campo.metadados.tipo_calculo || '';
              parametros.campo_referencia = campo.metadados.campo_referencia || '';
              parametros.contexto = campo.metadados.contexto || '';
              parametros.ordem_calculo = campo.metadados.ordem_calculo || 'asc';
              console.log('Found pontuacao config:', {
                regra_tipo: parametros.regra_tipo,
                formato_resultado: parametros.formato_resultado,
                tipo_calculo: parametros.tipo_calculo,
                campo_referencia: parametros.campo_referencia,
                contexto: parametros.contexto,
                ordem_calculo: parametros.ordem_calculo
              });
            } else {
              // Regular field - add to campos array
              camposArray.push({
                id: campo.id,
                chave_campo: campo.chave_campo,
                rotulo_campo: campo.rotulo_campo,
                tipo_input: campo.tipo_input,
                obrigatorio: campo.obrigatorio,
                ordem_exibicao: campo.ordem_exibicao,
                metadados: campo.metadados || {}
              });
            }
          });
        }

        // Add campos array to parametros for editing
        parametros.campos = camposArray.sort((a, b) => a.ordem_exibicao - b.ordem_exibicao);

        const modalidade = modalidades.find(m => m.id === modelo.modalidade_id);
        
        const enrichedModelo = {
          id: modelo.id,
          modalidade_id: modelo.modalidade_id,
          codigo_modelo: modelo.codigo_modelo,
          descricao: modelo.descricao,
          parametros,
          campos_modelo: campos, // Keep original campos for reference
          modalidade: {
            nome: modalidade?.nome || 'Modalidade não encontrada',
            categoria: modalidade?.categoria || null
          }
        };

        console.log('Final enriched modelo:', enrichedModelo);
        return enrichedModelo;
      });

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
