
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { differenceInYears } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

export function useUserAgeQuery() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { needsAcceptance, checkCompleted } = usePrivacyPolicyCheck();
  
  return useQuery({
    queryKey: ['user-age', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        navigate('/', { replace: true });
        return null;
      }

      // Using maybeSingle() instead of single() to handle null case gracefully
      const { data: userData, error } = await supabase
        .from('usuarios')
        .select('data_nascimento')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user birth date:', error);
        toast.error("Erro ao buscar informações do usuário");
        return null;
      }

      if (!userData?.data_nascimento) {
        return null;
      }

      const age = differenceInYears(new Date(), new Date(userData.data_nascimento));
      console.log('Calculated user age:', age);
      return age;
    },
    enabled: !!user?.id && checkCompleted,
    retry: 1, // Only retry once to avoid excessive retries on permanent errors
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Import at the top
import { usePrivacyPolicyCheck } from '@/hooks/usePrivacyPolicyCheck';
