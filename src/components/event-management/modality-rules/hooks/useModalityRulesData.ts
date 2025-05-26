
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Modality } from '../types';

export function useModalityRulesData(eventId: string | null) {
  const [modalities, setModalities] = useState<Modality[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchModalitiesWithRules = async () => {
      if (!eventId) return;
      
      setIsLoading(true);
      try {
        // Fetch modalities
        const { data: modalitiesData, error: modalitiesError } = await supabase
          .from('modalidades')
          .select('*')
          .eq('evento_id', eventId)
          .order('nome');
        
        if (modalitiesError) throw modalitiesError;
        
        // Fetch rules for these modalities
        const modalityIds = modalitiesData?.map(m => m.id) || [];
        const { data: rulesData, error: rulesError } = await supabase
          .from('modalidade_regras')
          .select('*')
          .in('modalidade_id', modalityIds);
        
        if (rulesError) {
          console.error('Error fetching rules:', rulesError);
        }
        
        // Combine data
        const modalitiesWithRules = modalitiesData?.map(modality => ({
          id: modality.id.toString(),
          nome: modality.nome,
          tipo_pontuacao: modality.tipo_pontuacao,
          tipo_modalidade: modality.tipo_modalidade,
          categoria: modality.categoria,
          status: modality.status,
          limite_vagas: modality.limite_vagas,
          vagas_ocupadas: 0, // This would need to be calculated
          grupo: modality.grupo,
          evento_id: modality.evento_id,
          faixa_etaria: modality.faixa_etaria,
          regra: rulesData?.find(r => r.modalidade_id === modality.id)
        })) || [];
        
        setModalities(modalitiesWithRules);
      } catch (error) {
        console.error('Error fetching modalities with rules:', error);
        toast.error('Erro ao carregar modalidades');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchModalitiesWithRules();
  }, [eventId]);

  return {
    modalities,
    setModalities,
    isLoading
  };
}
