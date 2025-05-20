
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
        
        // First, discover the column names by examining the table structure
        console.log('Attempting to discover correct column names...');
        
        // Direct query to get table schema information
        const { data: tableColumns, error: schemaError } = await supabase.rpc('get_table_columns', {
          table_name: 'logs_aceite_privacidade'
        });
        
        // If the RPC method doesn't exist, run a simpler query
        if (schemaError) {
          console.log('Using fallback method to discover columns');
          
          // Basic data to insert - these fields are certainly present
          const baseInsertData = {
            usuario_id: userId,
            versao_termo: latestPolicy.versao_termo,
            nome_completo: userMetadata?.nome_completo,
          };
          
          // Try inserting with the base data first - minimal fields
          const { error: baseInsertError } = await supabase
            .from('logs_aceite_privacidade')
            .insert(baseInsertData);
            
          if (baseInsertError) {
            console.error('Error with base insert:', baseInsertError);
            throw new Error('Não foi possível registrar o aceite do termo de privacidade');
          }
          
          return true;
        }
        
        console.log('Table columns discovered:', tableColumns);
        
        // Check if any of our expected columns exist
        const hasTermosPrivacidadeId = tableColumns?.some(col => col.column_name === 'termos_privacidade_id');
        const hasTermosId = tableColumns?.some(col => col.column_name === 'termos_id');
        
        // Build the data object based on existing columns
        const insertData = {
          usuario_id: userId,
          nome_completo: userMetadata?.nome_completo,
          tipo_documento: userMetadata?.tipo_documento,
          numero_documento: userMetadata?.numero_documento,
          versao_termo: latestPolicy.versao_termo,
        };
        
        // Add ID column based on what we found
        if (hasTermosPrivacidadeId) {
          console.log('Using termos_privacidade_id column');
          Object.assign(insertData, { termos_privacidade_id: latestPolicy.id });
        } else if (hasTermosId) {
          console.log('Using termos_id column');
          Object.assign(insertData, { termos_id: latestPolicy.id });
        } else {
          // No specific column for the term ID, just use the base data
          console.log('No term ID column found, proceeding with base data only');
        }
        
        console.log('Final insert data:', insertData);
        
        // Insert the acceptance record with our dynamic object
        const { error: insertError } = await supabase
          .from('logs_aceite_privacidade')
          .insert(insertData);
          
        if (insertError) {
          console.error('Error inserting acceptance record:', insertError);
          
          // Last resort: try with just the minimal required fields
          console.log('Trying minimal insert as last resort');
          const minimalData = {
            usuario_id: userId,
            versao_termo: latestPolicy.versao_termo
          };
          
          const { error: minimalError } = await supabase
            .from('logs_aceite_privacidade')
            .insert(minimalData);
            
          if (minimalError) {
            console.error('Minimal insert also failed:', minimalError);
            throw new Error('Não foi possível registrar o aceite do termo de privacidade');
          }
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
