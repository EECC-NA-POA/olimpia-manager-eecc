
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface EventDetails {
  id: string;
  nome: string;
  descricao?: string;
  local?: string;
  data_inicio?: string;
  data_fim?: string;
  data_inicio_inscricao?: string;
  data_fim_inscricao?: string;
  status_evento: string;
  criado_em: string;
  atualizado_em?: string;
}

export function useEventDetails(eventId: string | null) {
  const {
    data: event,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['event-details', eventId],
    queryFn: async () => {
      if (!eventId) return null;
      
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .eq('id', eventId)
        .single();
      
      if (error) throw error;
      
      return data as EventDetails;
    },
    enabled: !!eventId,
  });

  // Handle error
  useEffect(() => {
    if (error) {
      console.error('Error fetching event details:', error);
      toast.error('Erro ao carregar detalhes do evento');
    }
  }, [error]);

  return {
    event,
    isLoading,
    error,
    refetch
  };
}
