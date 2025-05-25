
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useAthletePaymentData(athleteId: string, eventId: string | null) {
  return useQuery({
    queryKey: ['athlete-payment', athleteId, eventId],
    queryFn: async () => {
      console.log('Fetching payment data for athlete:', athleteId, 'event:', eventId);
      
      if (!eventId) {
        console.log('No eventId provided, skipping payment query');
        return null;
      }
      
      const { data, error } = await supabase
        .from('pagamentos')
        .select('numero_identificador')
        .eq('atleta_id', athleteId)
        .eq('evento_id', eventId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching payment identifier:', error);
        return null;
      }
      
      console.log('Payment data fetched:', data);
      return data;
    },
    enabled: !!athleteId && !!eventId,
  });
}

export function useAthleteBranchData(athleteId: string) {
  return useQuery({
    queryKey: ['athlete-branch', athleteId],
    queryFn: async () => {
      console.log('Fetching branch data for athlete:', athleteId);
      
      // First, get the user's filial_id
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('filial_id')
        .eq('id', athleteId)
        .single();
      
      if (userError || !userData?.filial_id) {
        console.error('Error fetching user filial_id:', userError);
        return null;
      }
      
      console.log('User filial_id:', userData.filial_id);
      
      // Then get the branch details
      const { data: branchData, error: branchError } = await supabase
        .from('filiais')
        .select('nome, estado')
        .eq('id', userData.filial_id)
        .single();
      
      if (branchError) {
        console.error('Error fetching branch data:', branchError);
        return null;
      }
      
      console.log('Branch data fetched:', branchData);
      return branchData;
    },
    enabled: !!athleteId,
  });
}

export function useAthleteScores(athleteId: string) {
  return useQuery({
    queryKey: ['athlete-scores', athleteId],
    queryFn: async () => {
      console.log('Fetching scores for athlete:', athleteId);
      
      const { data, error } = await supabase
        .from('pontuacoes')
        .select('valor_pontuacao, modalidade_id')
        .eq('atleta_id', athleteId);
      
      if (error) {
        console.error('Error fetching athlete scores:', error);
        return [];
      }
      
      console.log('Athlete scores fetched:', data);
      return data || [];
    },
    enabled: !!athleteId,
  });
}
