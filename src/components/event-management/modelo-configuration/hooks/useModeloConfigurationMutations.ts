import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useModeloConfigurationMutations(refetch: () => void) {
  const saveConfigurationMutation = useMutation({
    mutationFn: async ({ modeloId, parametros }: { modeloId: number, parametros: any }) => {
      console.log('Saving configuration for modelo:', modeloId, 'with params:', parametros);
      
      // Get existing campos for this modelo
      const { data: existingCampos, error: fetchError } = await supabase
        .from('campos_modelo')
        .select('id, chave_campo')
        .eq('modelo_id', modeloId);

      if (fetchError) {
        console.error('Error fetching existing campos:', fetchError);
        throw fetchError;
      }

      console.log('Existing campos:', existingCampos);

      // Delete existing campos first
      if (existingCampos && existingCampos.length > 0) {
        const { error: deleteError } = await supabase
          .from('campos_modelo')
          .delete()
          .eq('modelo_id', modeloId);

        if (deleteError) {
          console.error('Error deleting existing campos:', deleteError);
          throw deleteError;
        }
        console.log('Deleted existing campos');
      }

      // Create or update campos based on parametros
      const camposToInsert = [];
      
      // Handle baterias configuration - explicitly check for undefined, not falsy values
      if (parametros.baterias !== undefined) {
        console.log('Saving baterias config:', {
          baterias: parametros.baterias,
          num_raias: parametros.num_raias,
          permite_final: parametros.permite_final
        });
        
        camposToInsert.push({
          modelo_id: modeloId,
          chave_campo: 'baterias',
          rotulo_campo: 'Usar Baterias',
          tipo_input: 'checkbox',
          obrigatorio: false,
          ordem_exibicao: 1000, // High order to put at end
          metadados: { 
            baterias: parametros.baterias, 
            num_raias: parametros.num_raias, // Don't use ?? 0 here, preserve the actual value including 0
            permite_final: parametros.permite_final || false 
          }
        });
      }

      // Handle scoring configuration
      if (parametros.regra_tipo) {
        camposToInsert.push({
          modelo_id: modeloId,
          chave_campo: 'pontuacao',
          rotulo_campo: 'Configuração de Pontuação',
          tipo_input: 'config',
          obrigatorio: true,
          ordem_exibicao: 1001, // High order to put at end
          metadados: { 
            regra_tipo: parametros.regra_tipo,
            formato_resultado: parametros.formato_resultado,
            tipo_calculo: parametros.tipo_calculo,
            campo_referencia: parametros.campo_referencia,
            contexto: parametros.contexto,
            ordem_calculo: parametros.ordem_calculo
          }
        });
      }

      // Handle custom campos from the form
      if (parametros.campos && Array.isArray(parametros.campos)) {
        parametros.campos.forEach((campo: any) => {
          // Only add campos that have meaningful data
          if (campo.chave_campo && campo.rotulo_campo) {
            camposToInsert.push({
              modelo_id: modeloId,
              chave_campo: campo.chave_campo,
              rotulo_campo: campo.rotulo_campo,
              tipo_input: campo.tipo_input || 'number',
              obrigatorio: campo.obrigatorio || false,
              ordem_exibicao: campo.ordem_exibicao || 1,
              metadados: campo.metadados || {}
            });
          }
        });
      }

      console.log('Campos to insert:', camposToInsert);

      // Insert new campos
      if (camposToInsert.length > 0) {
        const { data: insertedCampos, error: insertError } = await supabase
          .from('campos_modelo')
          .insert(camposToInsert)
          .select();
        
        if (insertError) {
          console.error('Error inserting campos:', insertError);
          throw insertError;
        }
        
        console.log('Successfully inserted campos:', insertedCampos);
      }

      console.log('Configuration saved successfully');
      return { success: true };
    },
    onSuccess: () => {
      toast.success('Configuração salva com sucesso!');
      refetch();
    },
    onError: (error) => {
      console.error('Error saving configuration:', error);
      toast.error('Erro ao salvar configuração: ' + error.message);
    }
  });

  const duplicateModeloMutation = useMutation({
    mutationFn: async ({ originalModelo, targetModalidadeId }: { originalModelo: any, targetModalidadeId: string }) => {
      console.log('Duplicating modelo:', originalModelo, 'to modalidade:', targetModalidadeId);
      
      // Create new modelo_modalidade
      const { data: newModelo, error: createError } = await supabase
        .from('modelos_modalidade')
        .insert({
          modalidade_id: targetModalidadeId,
          codigo_modelo: originalModelo.codigo_modelo + '_copy',
          descricao: originalModelo.descricao + ' (Cópia)'
        })
        .select()
        .single();

      if (createError) throw createError;

      // Get original campos
      const { data: originalCampos, error: fetchError } = await supabase
        .from('campos_modelo')
        .select('*')
        .eq('modelo_id', originalModelo.id);

      if (fetchError) throw fetchError;

      // Copy campos to new modelo
      if (originalCampos && originalCampos.length > 0) {
        const camposToInsert = originalCampos.map(campo => ({
          modelo_id: newModelo.id,
          chave_campo: campo.chave_campo,
          rotulo_campo: campo.rotulo_campo,
          tipo_input: campo.tipo_input,
          obrigatorio: campo.obrigatorio,
          ordem_exibicao: campo.ordem_exibicao,
          metadados: campo.metadados
        }));

        const { error: insertError } = await supabase
          .from('campos_modelo')
          .insert(camposToInsert);

        if (insertError) throw insertError;
      }

      return newModelo;
    },
    onSuccess: () => {
      toast.success('Modelo duplicado com sucesso!');
      refetch();
    },
    onError: (error) => {
      console.error('Error duplicating modelo:', error);
      toast.error('Erro ao duplicar modelo: ' + error.message);
    }
  });

  const saveConfiguration = async (modeloId: number, parametros: any) => {
    console.log('saveConfiguration called with:', { modeloId, parametros });
    await saveConfigurationMutation.mutateAsync({ modeloId, parametros });
  };

  const duplicateModelo = async (originalModelo: any, targetModalidadeId: string) => {
    await duplicateModeloMutation.mutateAsync({ originalModelo, targetModalidadeId });
  };

  return {
    isSaving: saveConfigurationMutation.isPending,
    isDuplicating: duplicateModeloMutation.isPending,
    saveConfiguration,
    duplicateModelo
  };
}
