
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Modality {
  id: string;
  evento_id: string;
  nome: string;
  descricao: string;
  vagas: number;
  is_ativo: boolean;
  genero: string;
  faixa_etaria_min: number;
  faixa_etaria_max: number | null;
  tipo: string;
}

export function useModalitiesData(eventId: string | null) {
  const [modalities, setModalities] = useState<Modality[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchModalities = async () => {
      if (!eventId) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('modalidades')
          .select('*')
          .eq('evento_id', eventId)
          .order('nome');
        
        if (error) throw error;
        
        setModalities(data || []);
      } catch (error) {
        console.error('Error fetching modalities:', error);
        toast.error('Erro ao carregar modalidades');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchModalities();
  }, [eventId]);

  const addModality = (newModality: Modality) => {
    setModalities([...modalities, newModality]);
  };

  const updateModality = (updatedModality: Modality) => {
    setModalities(modalities.map(item => 
      item.id === updatedModality.id ? updatedModality : item
    ));
  };

  const removeModality = (modalityId: string) => {
    setModalities(modalities.filter(item => item.id !== modalityId));
  };

  return {
    modalities,
    isLoading,
    addModality,
    updateModality,
    removeModality
  };
}
