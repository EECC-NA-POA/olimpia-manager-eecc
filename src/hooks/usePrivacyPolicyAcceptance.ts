
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
        console.log('Starting privacy policy acceptance registration for user:', userId);
        
        if (!userId) {
          console.error('Cannot register acceptance: User ID is missing');
          throw new Error('Usuário não identificado');
        }
        
        // Step 1: Get the latest privacy policy
        console.log('Fetching latest privacy policy...');
        const { data: latestPolicy, error: policyError } = await supabase
          .from('termos_privacidade')
          .select('id, versao_termo')
          .eq('ativo', true)
          .order('data_criacao', { ascending: false })
          .limit(1)
          .single();
          
        if (policyError) {
          console.error('Error fetching latest policy:', policyError);
          throw new Error('Não foi possível obter a versão do termo de privacidade');
        }
        
        if (!latestPolicy) {
          console.error('No active privacy policy found');
          throw new Error('Não há política de privacidade ativa');
        }
        
        console.log('Latest policy found:', latestPolicy);
        
        // Step 2: Try direct insert with minimal fields first (most likely to work)
        console.log('Attempting insert with minimal fields...');
        const minimalData = {
          usuario_id: userId,
          versao_termo: latestPolicy.versao_termo
        };
        
        const { error: minimalInsertError } = await supabase
          .from('logs_aceite_privacidade')
          .insert(minimalData);
        
        if (!minimalInsertError) {
          console.log('Success: Acceptance registered with minimal fields');
          return true;
        }
        
        console.warn('Minimal insert failed:', minimalInsertError);
        console.log('Trying alternative approaches...');
        
        // Step 3: Try with term ID field(s)
        const insertWithTermId = async () => {
          const attempts = [
            { field: 'termos_privacidade_id', value: latestPolicy.id },
            { field: 'termos_id', value: latestPolicy.id },
            { field: 'termo_id', value: latestPolicy.id }
          ];
          
          for (const attempt of attempts) {
            const termData = {
              usuario_id: userId,
              versao_termo: latestPolicy.versao_termo,
              [attempt.field]: attempt.value
            };
            
            console.log(`Trying with ${attempt.field}:`, termData);
            
            const { error: termInsertError } = await supabase
              .from('logs_aceite_privacidade')
              .insert(termData);
              
            if (!termInsertError) {
              console.log(`Success with ${attempt.field}`);
              return true;
            }
            
            console.warn(`Failed with ${attempt.field}:`, termInsertError);
          }
          
          return false;
        };
        
        const termIdSuccess = await insertWithTermId();
        if (termIdSuccess) return true;
        
        // Step 4: Try with user metadata
        console.log('Trying with user metadata...');
        const fullData = {
          usuario_id: userId,
          versao_termo: latestPolicy.versao_termo,
          termos_id: latestPolicy.id,
          nome_completo: userMetadata?.nome_completo,
          tipo_documento: userMetadata?.tipo_documento,
          numero_documento: userMetadata?.numero_documento
        };
        
        const { error: fullInsertError } = await supabase
          .from('logs_aceite_privacidade')
          .insert(fullData);
          
        if (!fullInsertError) {
          console.log('Success with full user metadata');
          return true;
        }
        
        console.error('All insert attempts failed. Last error:', fullInsertError);
        
        // Step 5: Last resort - direct SQL insert
        console.log('Attempting direct SQL insert as last resort...');
        const { error: sqlError } = await supabase.rpc('insert_privacy_acceptance', { 
          p_user_id: userId,
          p_version: latestPolicy.versao_termo
        });
        
        if (!sqlError) {
          console.log('Success with direct SQL insert');
          return true;
        }
        
        console.error('Direct SQL insert failed:', sqlError);
        throw new Error('Não foi possível registrar o aceite do termo de privacidade após múltiplas tentativas');
      } catch (error) {
        console.error('Final error in registerAcceptanceMutation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('Privacy policy acceptance registered successfully');
      toast.success("Termo de privacidade aceito com sucesso!");
      setAccepted(true);
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
    console.log('User clicked to accept privacy policy');
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
