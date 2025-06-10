
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface Modalidade {
  id: number;
  nome: string;
  categoria: string;
  tipo_pontuacao: string;
  tipo_modalidade: string;
}

export function useModalidadesData(eventId: string | null) {
  return useQuery({
    queryKey: ['modalidades', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      
      const { data, error } = await supabase
        .from('modalidades')
        .select('id, nome, categoria, tipo_pontuacao, tipo_modalidade')
        .eq('evento_id', eventId)
        .order('nome');
      
      if (error) throw error;
      
      // Debug logging detalhado
      console.log('Raw modalidades data from database:', data);
      data?.forEach((modalidade, index) => {
        console.log(`Modalidade ${index + 1}:`, {
          id: modalidade.id,
          nome: modalidade.nome,
          categoria: modalidade.categoria,
          categoria_type: typeof modalidade.categoria,
          categoria_length: modalidade.categoria?.length,
          raw_object: modalidade
        });
      });
      
      return data as Modalidade[];
    },
    enabled: !!eventId
  });
}
