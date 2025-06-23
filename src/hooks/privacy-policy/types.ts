
export interface UsePrivacyPolicyAcceptanceProps {
  userId?: string;
  userMetadata?: {
    nome_completo?: string;
    tipo_documento?: string;
    numero_documento?: string;
  };
  onAcceptSuccess: () => void;
}

export interface PrivacyPolicyAcceptanceResult {
  policyContent: string | null;
  isLoading: boolean;
  error: Error | null;
  handleRetryLoad: () => void;
  handleAccept: () => void;
  accepted: boolean;
  isPending: boolean;
  policyContentHasError: boolean;
}
