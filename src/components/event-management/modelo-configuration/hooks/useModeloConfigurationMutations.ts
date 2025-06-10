
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useModeloConfigurationMutations(refetch: () => void) {
  const saveConfigurationMutation = useMutation({
    mutationFn: async ({ modeloId, parametros }: { modeloId: number, parametros: any }) => {
      const { error } = await supabase
        .from('modelos_modalidade')
        .update({ parametros })
        .eq('id', modeloId);

      if (error) throw error;
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
