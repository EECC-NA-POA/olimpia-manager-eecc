
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface UserModalityRep {
  id: string;
  modalidade_id: string;
  filial_id: string;
  atleta_id: string;
  modalidades: {
    nome: string;
  };
  filiais: {
    nome: string;
  };
}

export const useUserModalityReps = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-modality-reps', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log('Fetching user modality representatives for user:', user.id);
      
      const { data, error } = await supabase
        .from('modalidade_representantes')
        .select(`
          id,
          modalidade_id,
          filial_id,
          atleta_id,
          modalidades!modalidade_representantes_modalidade_id_fkey (nome),
          filiais!modalidade_representantes_filial_id_fkey (nome)
        `)
        .eq('atleta_id', user.id);

      if (error) {
        console.error('Error fetching user modality representatives:', error);
        throw error;
      }

      console.log('User modality representatives:', data);
      
      // Transform the data to match our interface
      const transformedData = data?.map(item => ({
        ...item,
        modalidades: Array.isArray(item.modalidades) ? item.modalidades[0] : item.modalidades,
        filiais: Array.isArray(item.filiais) ? item.filiais[0] : item.filiais,
      })) || [];
      
      return transformedData as UserModalityRep[];
    },
    enabled: !!user?.id,
  });
};
