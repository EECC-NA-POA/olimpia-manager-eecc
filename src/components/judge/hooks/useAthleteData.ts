
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useAthletePaymentData(athleteId: string, eventId: string | null) {
  return useQuery({
    queryKey: ['athlete-payment', athleteId, eventId],
    queryFn: async () => {
      console.log('=== PAYMENT QUERY DEBUG ===');
      console.log('Input athleteId:', athleteId);
      console.log('Input eventId:', eventId);
      console.log('athleteId type:', typeof athleteId);
      console.log('eventId type:', typeof eventId);
      
      // If we have eventId, try to get payment for specific event first
      if (eventId) {
        console.log('Trying to get payment for specific event:', eventId);
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
        }
        
        if (data) {
          console.log('SUCCESS: Found payment data for specific event with numero_identificador:', data.numero_identificador);
          console.log('=== END PAYMENT QUERY DEBUG ===');
          return data;
        } else {
          console.log('No payment found for specific event');
        }
      }
      
      // If no eventId or no payment found for specific event, get any payment for this athlete
      console.log('Getting any payment for athlete:', athleteId);
      const { data: allPayments, error: allError } = await supabase
        .from('pagamentos')
        .select('*')
        .eq('atleta_id', athleteId)
        .order('data_criacao', { ascending: false }); // Get most recent first
      
      console.log('All payments for athlete:', allPayments);
      if (allError) {
        console.log('Error fetching all payments:', allError);
        console.log('=== END PAYMENT QUERY DEBUG ===');
        return null;
      }
      
      if (allPayments && allPayments.length > 0) {
        const latestPayment = allPayments[0]; // Get the most recent payment
        console.log('Using latest payment record:', latestPayment);
        console.log('numero_identificador from latest payment:', latestPayment.numero_identificador);
        console.log('=== END PAYMENT QUERY DEBUG ===');
        return latestPayment;
      }
      
      console.log('NO PAYMENT DATA FOUND for athleteId:', athleteId);
      console.log('=== END PAYMENT QUERY DEBUG ===');
      return null;
    },
    enabled: !!athleteId,
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
