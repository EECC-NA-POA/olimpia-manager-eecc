
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

      // Create or update campos based on parametros
      const camposToUpsert = [];
      
      // Handle baterias configuration
      if (parametros.baterias !== undefined) {
        const bateriasCampo = existingCampos?.find(c => c.chave_campo === 'baterias');
        camposToUpsert.push({
          id: bateriasCampo?.id,
          modelo_id: modeloId,
          chave_campo: 'baterias',
          rotulo_campo: 'Usar Baterias',
          tipo_input: 'checkbox',
          obrigatorio: false,
          ordem_exibicao: 1,
          metadados: { baterias: parametros.baterias, num_raias: parametros.num_raias || 8, permite_final: parametros.permite_final || false }
        });
      }

      // Handle scoring configuration
      if (parametros.regra_tipo) {
        const scoringCampo = existingCampos?.find(c => c.chave_campo === 'pontuacao');
        camposToUpsert.push({
          id: scoringCampo?.id,
          modelo_id: modeloId,
          chave_campo: 'pontuacao',
          rotulo_campo: 'Configuração de Pontuação',
          tipo_input: 'select',
          obrigatorio: true,
          ordem_exibicao: 2,
          metadados: { 
            regra_tipo: parametros.regra_tipo,
            unidade: parametros.unidade || '',
            subunidade: parametros.subunidade || ''
          }
        });
      }

      // Upsert campos
      for (const campo of camposToUpsert) {
        if (campo.id) {
          // Update existing
          const { error: updateError } = await supabase
            .from('campos_modelo')
            .update({
              rotulo_campo: campo.rotulo_campo,
              tipo_input: campo.tipo_input,
              obrigatorio: campo.obrigatorio,
              ordem_exibicao: campo.ordem_exibicao,
              metadados: campo.metadados
            })
            .eq('id', campo.id);
          
          if (updateError) throw updateError;
        } else {
          // Insert new
          const { error: insertError } = await supabase
            .from('campos_modelo')
            .insert({
              modelo_id: campo.modelo_id,
              chave_campo: campo.chave_campo,
              rotulo_campo: campo.rotulo_campo,
              tipo_input: campo.tipo_input,
              obrigatorio: campo.obrigatorio,
              ordem_exibicao: campo.ordem_exibicao,
              metadados: campo.metadados
            });
          
          if (insertError) throw insertError;
        }
      }
    },
    onSuccess: () => {
      toast.success('Configuração salva com sucesso!');
      refetch();
    },
    onError: (error) => {
      console.error('Error saving configuration:', error);
      toast.error('Erro ao salvar configuração');
    }
  });

  const saveConfiguration = async (modeloId: number, parametros: any) => {
    await saveConfigurationMutation.mutateAsync({ modeloId, parametros });
  };

  return {
    isSaving: saveConfigurationMutation.isPending,
    saveConfiguration
  };
}
