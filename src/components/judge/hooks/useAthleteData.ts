
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useAthletePaymentData(athleteId: string, eventId: string | null) {
  return useQuery({
    queryKey: ['athlete-payment', athleteId, eventId],
    queryFn: async () => {
      console.log('=== PAYMENT QUERY DEBUG ===');
      console.log('Input athleteId:', athleteId);
      console.log('Input eventId:', eventId);
      console.log('athleteId type:', typeof athleteId);
      console.log('eventId type:', typeof eventId);
      
      if (!eventId) {
        console.log('No eventId provided, skipping payment query');
        return null;
      }
      
      // First, let's check what's in the pagamentos table for this athlete
      console.log('Checking all payments for athlete:', athleteId);
      const { data: allPayments, error: allError } = await supabase
        .from('pagamentos')
        .select('*')
        .eq('atleta_id', athleteId);
      
      console.log('All payments for athlete:', allPayments);
      if (allError) console.log('Error fetching all payments:', allError);
      
      // Now try the specific query
      const { data, error } = await supabase
        .from('pagamentos')
        .select('*')
        .eq('atleta_id', athleteId)
        .eq('evento_id', eventId)
        .maybeSingle();
      
      console.log('Specific payment query result:', data);
      console.log('Specific payment query error:', error);
      
      if (error) {
        console.error('Error fetching payment data:', error);
        return null;
      }
      
      if (data) {
        console.log('SUCCESS: Found payment data with numero_identificador:', data.numero_identificador);
      } else {
        console.log('NO PAYMENT DATA FOUND for athleteId:', athleteId, 'eventId:', eventId);
      }
      
      console.log('=== END PAYMENT QUERY DEBUG ===');
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
