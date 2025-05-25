
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Modality } from '../types';

export function useModalityRulesData(eventId: string | null) {
  const [modalities, setModalities] = useState<Modality[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchModalitiesAndRules = async () => {
      if (!eventId) return;
      
      setIsLoading(true);
      try {
        // Fetch modalities with all fields
        const { data: modalitiesData, error: modalitiesError } = await supabase
          .from('modalidades')
          .select('*')
          .eq('evento_id', eventId)
          .order('nome');
        
        if (modalitiesError) throw modalitiesError;

        // Fetch existing rules
        const { data: rulesData, error: rulesError } = await supabase
          .from('modalidade_regras')
          .select('*')
          .in('modalidade_id', modalitiesData?.map(m => m.id) || []);
        
        if (rulesError) throw rulesError;

        // Combine modalities with their rules
        const modalitiesWithRules = modalitiesData?.map(modality => ({
          ...modality,
          regra: rulesData?.find(rule => rule.modalidade_id === modality.id)
        })) || [];
        
        setModalities(modalitiesWithRules);
      } catch (error) {
        console.error('Error fetching modalities and rules:', error);
        toast.error('Erro ao carregar modalidades e regras');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchModalitiesAndRules();
  }, [eventId]);

  return {
    modalities,
    setModalities,
    isLoading,
  };
}
