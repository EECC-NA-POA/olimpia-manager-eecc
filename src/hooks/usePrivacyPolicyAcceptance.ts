
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchActivePrivacyPolicy } from "@/lib/api/privacyPolicy";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface UsePrivacyPolicyAcceptanceProps {
  userId?: string;
  userMetadata?: {
    nome_completo?: string;
    tipo_documento?: string;
    numero_documento?: string;
  };
  onAcceptSuccess: () => void;
}

export const usePrivacyPolicyAcceptance = ({ 
  userId, 
  userMetadata,
  onAcceptSuccess 
}: UsePrivacyPolicyAcceptanceProps) => {
  const [accepted, setAccepted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Fetch the latest privacy policy
  const { 
    data: policyContent, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['latest-privacy-policy', retryCount],
    queryFn: fetchActivePrivacyPolicy,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mutation to register user acceptance
  const registerAcceptanceMutation = useMutation({
    mutationFn: async () => {
      try {
        if (!userId) {
          throw new Error('Usuário não identificado');
        }
        
        // Get the latest privacy policy version
        const { data: latestPolicy, error: policyError } = await supabase
          .from('termos_privacidade')
          .select('id, versao_termo, termo_texto')
          .eq('ativo', true)
          .order('data_criacao', { ascending: false })
          .limit(1)
          .single();
          
        if (policyError || !latestPolicy) {
          console.error('Error fetching latest policy:', policyError);
          throw new Error('Não foi possível obter a versão do termo de privacidade');
        }
        
        console.log('Registering privacy policy acceptance for user:', userId, 'policy:', latestPolicy.versao_termo);
        console.log('Database structure:', {
          usuario_id: userId,
          termo_id: latestPolicy.id,
          nome_completo: userMetadata?.nome_completo,
          tipo_documento: userMetadata?.tipo_documento,
          numero_documento: userMetadata?.numero_documento,
          versao_termo: latestPolicy.versao_termo
        });
        
        // Registrar o aceite do usuário com a estrutura correta da tabela
        const { error: acceptanceError } = await supabase
          .from('logs_aceite_privacidade')
          .insert({
            usuario_id: userId,
            termo_id: latestPolicy.id,
            nome_completo: userMetadata?.nome_completo,
            tipo_documento: userMetadata?.tipo_documento,
            numero_documento: userMetadata?.numero_documento,
            versao_termo: latestPolicy.versao_termo
          });
          
        if (acceptanceError) {
          console.error('Error registering acceptance:', acceptanceError);
          throw new Error('Não foi possível registrar o aceite do termo de privacidade');
        }
        
        return true;
      } catch (error) {
        console.error('Error in registerAcceptanceMutation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('Privacy policy acceptance registered successfully');
      toast.success("Termo de privacidade aceito com sucesso!");
      onAcceptSuccess();
    },
    onError: (error) => {
      console.error('Failed to register privacy policy acceptance:', error);
      toast.error("Não foi possível registrar o aceite do termo de privacidade");
    }
  });

  const handleRetryLoad = () => {
    setRetryCount(prev => prev + 1);
    refetch();
  };

  const handleAccept = () => {
    setAccepted(true);
    registerAcceptanceMutation.mutate();
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
    handleAccept,
    accepted,
    isPending: registerAcceptanceMutation.isPending,
    policyContentHasError
  };
};
