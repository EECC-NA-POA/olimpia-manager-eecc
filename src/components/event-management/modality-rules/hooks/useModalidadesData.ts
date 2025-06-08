
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
      
      // Debug logging to see what we're getting
      console.log('Modalidades data:', data);
      data?.forEach(modalidade => {
        console.log(`Modalidade: ${modalidade.nome}, Categoria: "${modalidade.categoria}"`);
      });
      
      return data as Modalidade[];
    },
    enabled: !!eventId
  });
}
