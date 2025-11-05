import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface UpdatePersonalInfoData {
  userId: string;
  telefone: string;
  data_nascimento: Date;
}

export const useUpdatePersonalInfo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, telefone, data_nascimento }: UpdatePersonalInfoData) => {
      console.log('Updating personal info for user:', userId);
      console.log('New data:', { telefone, data_nascimento });

      // Format date to YYYY-MM-DD for PostgreSQL
      const formattedDate = format(data_nascimento, 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('usuarios')
        .update({
          telefone,
          data_nascimento: formattedDate,
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating personal info:', error);
        throw error;
      }

      console.log('Personal info updated successfully:', data);
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate athlete profile queries to refresh data
      queryClient.invalidateQueries({ 
        queryKey: ['athlete-profile', variables.userId] 
      });
      
      toast({
        title: "Dados atualizados",
        description: "Suas informações pessoais foram atualizadas com sucesso.",
        variant: "success",
      });
    },
    onError: (error: any) => {
      console.error('Error in useUpdatePersonalInfo:', error);
      toast({
        title: "Erro ao atualizar",
        description: error.message || "Não foi possível atualizar suas informações. Tente novamente.",
        variant: "error",
      });
    },
  });
};
