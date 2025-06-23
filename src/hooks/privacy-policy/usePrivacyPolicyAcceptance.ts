
import { useFetchPrivacyPolicy } from './useFetchPrivacyPolicy';
import { useRegisterAcceptance } from './useRegisterAcceptance';
import { UsePrivacyPolicyAcceptanceProps, PrivacyPolicyAcceptanceResult } from './types';

export const usePrivacyPolicyAcceptance = ({ 
  userId, 
  userMetadata,
  onAcceptSuccess 
}: UsePrivacyPolicyAcceptanceProps): PrivacyPolicyAcceptanceResult => {
  const {
    policyContent,
    isLoading,
    error,
    handleRetryLoad,
    policyContentHasError
  } = useFetchPrivacyPolicy();
  
  const {
    accepted,
    isPending,
    handleAccept
  } = useRegisterAcceptance({
    userId,
    userMetadata,
    onAcceptSuccess
  });

  return {
    policyContent,
    isLoading,
    error,
    handleRetryLoad,
    handleAccept,
    accepted,
    isPending,
    policyContentHasError
  };
};
