
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface UsePrivacyPolicyCheckResult {
  needsAcceptance: boolean;
  isLoading: boolean;
  error: Error | null;
  checkCompleted: boolean;
  refetchCheck: () => Promise<void>;
}

export const usePrivacyPolicyCheck = (): UsePrivacyPolicyCheckResult => {
  const { user } = useAuth();
  const [needsAcceptance, setNeedsAcceptance] = useState(false);
  const [checkCompleted, setCheckCompleted] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const checkLatestAcceptance = async () => {
    if (!user?.id) {
      setCheckCompleted(true);
      return { needsAcceptance: false };
    }

    try {
      console.log('Checking if user has accepted latest privacy policy...');

      // Get the latest active privacy policy
      const { data: latestPolicy, error: policyError } = await supabase
        .from('termos_privacidade')
        .select('id, versao_termo, data_criacao')
        .eq('ativo', true)
        .order('data_criacao', { ascending: false })
        .limit(1)
        .single();

      if (policyError) {
        console.error('Error fetching latest policy:', policyError);
        throw new Error('Não foi possível verificar os termos de privacidade');
      }

      if (!latestPolicy) {
        console.log('No active privacy policy found');
        return { needsAcceptance: false };
      }

      console.log('Latest policy found:', latestPolicy);

      // Check if the user has accepted this specific version
      const { data: acceptances, error: acceptancesError } = await supabase
        .from('logs_aceite_privacidade')
        .select('*')
        .eq('usuario_id', user.id)
        .eq('versao_termo', latestPolicy.versao_termo);

      if (acceptancesError) {
        console.error('Error checking user acceptances:', acceptancesError);
        throw new Error('Não foi possível verificar os aceites de privacidade');
      }

      const hasAccepted = acceptances && acceptances.length > 0;
      console.log('User has accepted latest policy:', hasAccepted);
      
      return { needsAcceptance: !hasAccepted };
    } catch (err: any) {
      console.error('Error in checkLatestAcceptance:', err);
      throw err;
    }
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['privacy-policy-acceptance', user?.id],
    queryFn: checkLatestAcceptance,
    enabled: !!user?.id,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
    meta: {
      skipThrow: true
    }
  });

  useEffect(() => {
    if (!isLoading && data) {
      setNeedsAcceptance(data.needsAcceptance);
      setCheckCompleted(true);
    }
  }, [isLoading, data]);

  const refetchCheck = async () => {
    try {
      const result = await refetch();
      if (result.data) {
        setNeedsAcceptance(result.data.needsAcceptance);
      }
    } catch (err: any) {
      console.error('Error refetching privacy policy check:', err);
      setError(err);
    }
  };

  return {
    needsAcceptance,
    isLoading,
    error,
    checkCompleted,
    refetchCheck
  };
};
