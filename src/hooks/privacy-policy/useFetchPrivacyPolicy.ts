
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchActivePrivacyPolicy } from "@/lib/api/privacyPolicy";

export const useFetchPrivacyPolicy = () => {
  const [retryCount, setRetryCount] = useState(0);
  
  const { 
    data: policyContent, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['latest-privacy-policy', retryCount],
    queryFn: fetchActivePrivacyPolicy,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const handleRetryLoad = () => {
    setRetryCount(prev => prev + 1);
    refetch();
  };

  const policyContentHasError = 
    error !== null || 
    !policyContent || 
    (typeof policyContent === 'string' && policyContent.includes('Não foi possível carregar'));

  return {
    policyContent,
    isLoading,
    error,
    handleRetryLoad,
    policyContentHasError
  };
};
