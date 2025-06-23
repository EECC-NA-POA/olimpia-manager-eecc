
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Athlete } from '../../hooks/useAthletes';
import { AthleteWithBranchData } from '../types';

interface UseAthleteDataProps {
  athletes: Athlete[] | undefined;
  eventId: string | null;
}

export function useAthleteData({ athletes, eventId }: UseAthleteDataProps) {
  // Fetch branch data for all athletes
  const { data: branchesData } = useQuery({
    queryKey: ['athletes-branches', athletes?.map(a => a.atleta_id)],
    queryFn: async () => {
      if (!athletes || athletes.length === 0) return {};
      
      console.log('Fetching branch data for athletes:', athletes.length);
      
      // Get user filial_ids for all athletes
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('id, filial_id')
        .in('id', athletes.map(a => a.atleta_id));
      
      if (userError || !userData) {
        console.error('Error fetching user filial data:', userError);
        return {};
      }
      
      // Get unique filial_ids
      const filialIds = [...new Set(userData.map(u => u.filial_id).filter(Boolean))];
      
      if (filialIds.length === 0) return {};
      
      // Get branch details
      const { data: branchData, error: branchError } = await supabase
        .from('filiais')
        .select('id, nome, estado')
        .in('id', filialIds);
      
      if (branchError || !branchData) {
        console.error('Error fetching branch data:', branchError);
        return {};
      }
      
      // Create a mapping from athlete_id to branch data
      const branchMap: Record<string, { nome: string; estado: string }> = {};
      
      userData.forEach(user => {
        if (user.filial_id) {
          const branch = branchData.find(b => b.id === user.filial_id);
          if (branch) {
            branchMap[user.id] = {
              nome: branch.nome,
              estado: branch.estado
            };
          }
        }
      });
      
      console.log('Branch mapping created:', branchMap);
      return branchMap;
    },
    enabled: !!athletes && athletes.length > 0,
  });

  // Fetch payment data for all athletes to get their numero_identificador
  const { data: paymentData } = useQuery({
    queryKey: ['athletes-payments', athletes?.map(a => a.atleta_id), eventId],
    queryFn: async () => {
      if (!athletes || athletes.length === 0) return {};
      
      console.log('Fetching payment data for athletes to get identifiers');
      
      // Get payment data for all athletes
      const { data: payments, error } = await supabase
        .from('pagamentos')
        .select('atleta_id, numero_identificador, evento_id')
        .in('atleta_id', athletes.map(a => a.atleta_id));
      
      if (error) {
        console.error('Error fetching payment data:', error);
        return {};
      }
      
      // Create a mapping from athlete_id to numero_identificador
      const paymentMap: Record<string, string> = {};
      
      payments?.forEach(payment => {
        // Prefer payment for current event, fallback to any payment
        if (eventId && payment.evento_id === eventId) {
          paymentMap[payment.atleta_id] = payment.numero_identificador;
        } else if (!paymentMap[payment.atleta_id]) {
          paymentMap[payment.atleta_id] = payment.numero_identificador;
        }
      });
      
      console.log('Payment mapping created:', paymentMap);
      return paymentMap;
    },
    enabled: !!athletes && athletes.length > 0,
  });

  // Combine athletes with their branch data and payment identifiers
  const athletesWithBranchData: AthleteWithBranchData[] = useMemo(() => {
    if (!athletes) return [];
    
    return athletes.map(athlete => ({
      ...athlete,
      branchName: branchesData?.[athlete.atleta_id]?.nome,
      branchState: branchesData?.[athlete.atleta_id]?.estado,
      numero_identificador: paymentData?.[athlete.atleta_id] || athlete.atleta_id.slice(-6)
    }));
  }, [athletes, branchesData, paymentData]);

  // Get unique branches and states for filter options
  const { availableBranches, availableStates } = useMemo(() => {
    const branches = new Map<string, string>();
    const states = new Set<string>();

    athletesWithBranchData.forEach(athlete => {
      if (athlete.branchName && athlete.branchState) {
        branches.set(athlete.branchName, athlete.branchState);
        states.add(athlete.branchState);
      }
    });

    return {
      availableBranches: Array.from(branches.entries()).map(([name, state]) => ({ name, state })),
      availableStates: Array.from(states).sort()
    };
  }, [athletesWithBranchData]);

  return {
    athletesWithBranchData,
    availableBranches,
    availableStates
  };
}
