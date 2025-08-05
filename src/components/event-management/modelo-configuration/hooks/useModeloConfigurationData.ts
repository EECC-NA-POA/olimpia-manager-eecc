
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useModeloConfigurationData(eventId: string | null) {
  const { data: modelos = [], isLoading, refetch } = useQuery({
    queryKey: ['modelo-configurations', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      
      console.log('Fetching modelo configurations for event:', eventId);
      
      try {
        // Use RPC function to bypass RLS issues
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('get_modelo_configurations', { p_event_id: eventId });

        if (rpcError) {
          console.error('RPC Error fetching modelo configurations:', rpcError);
          throw rpcError;
        }

        console.log('RPC data received:', rpcData);

        if (!rpcData || rpcData.length === 0) {
          console.log('No modelos found via RPC for event');
          return [];
        }

        // Process each modelo to build the enriched data structure
        const enrichedModelos = rpcData.map((modelo: any) => {
          console.log('Processing RPC modelo:', modelo.id, modelo.codigo_modelo);
          
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
            campos.forEach((campo: any) => {
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
          
          const enrichedModelo = {
            id: modelo.id,
            modalidade_id: modelo.modalidade_id,
            codigo_modelo: modelo.codigo_modelo,
            descricao: modelo.descricao,
            parametros,
            campos_modelo: campos, // Keep original campos for reference
            modalidade: {
              nome: modelo.modalidade_nome || 'Modalidade não encontrada',
              categoria: modelo.modalidade_categoria || null
            }
          };

          console.log('Final enriched modelo:', enrichedModelo);
          return enrichedModelo;
        });

        console.log('Final enriched modelos data:', enrichedModelos);
        return enrichedModelos;
      } catch (error) {
        console.error('Error in modelo configuration query:', error);
        throw error;
      }
    },
    enabled: !!eventId,
  });

  return { modelos, isLoading, refetch };
}
