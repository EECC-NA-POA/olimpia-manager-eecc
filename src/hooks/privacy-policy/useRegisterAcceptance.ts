
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface RegisterAcceptanceProps {
  userId?: string;
  userMetadata?: {
    nome_completo?: string;
    tipo_documento?: string;
    numero_documento?: string;
  };
  onAcceptSuccess: () => void;
}

export const useRegisterAcceptance = ({
  userId,
  userMetadata,
  onAcceptSuccess
}: RegisterAcceptanceProps) => {
  const [accepted, setAccepted] = useState(false);

  const registerAcceptanceMutation = useMutation({
    mutationFn: async () => {
      try {
        console.log('Starting privacy policy acceptance registration for user:', userId);
        
        if (!userId) {
          console.error('Cannot register acceptance: User ID is missing');
          throw new Error('Usuário não identificado');
        }
        
        // Nome do usuário para registro
        const nomeUsuario = userMetadata?.nome_completo || 'Usuário';
        
        // Step 1: Get the latest privacy policy with all required fields
        console.log('Fetching latest privacy policy with complete data...');
        const { data: latestPolicy, error: policyError } = await supabase
          .from('termos_privacidade')
          .select('id, versao_termo, termo_texto')
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
        
        // Preparar dados completos para inserção conforme estrutura da tabela
        const acceptanceData = {
          usuario_id: userId,
          versao_termo: latestPolicy.versao_termo,
          termo_texto: latestPolicy.termo_texto,
          termo_privacidade_id: latestPolicy.id
        };
        
        console.log('Inserting acceptance record with complete data:', {
          ...acceptanceData,
          termo_texto: 'texto longo omitido para logs'
        });
        
        const { error: insertError } = await supabase
          .from('logs_aceite_privacidade')
          .insert(acceptanceData);
        
        if (insertError) {
          console.error('Error inserting acceptance record:', insertError);
          
          // Se a inserção falhar, tentar com RPC personalizado
          console.log('Attempting with custom RPC...');
          try {
            const { error: rpcError } = await supabase.rpc('register_privacy_acceptance', {
              p_user_id: userId,
              p_version: latestPolicy.versao_termo,
              p_policy_id: latestPolicy.id,
              p_policy_text: latestPolicy.termo_texto
            });
            
            if (rpcError) {
              console.error('RPC method failed:', rpcError);
              throw rpcError;
            }
            
            console.log('Acceptance registered successfully via RPC');
            return true;
          } catch (rpcErr) {
            console.error('RPC attempt failed:', rpcErr);
            throw new Error('Não foi possível registrar o aceite do termo de privacidade após múltiplas tentativas');
          }
        }
        
        console.log('Acceptance registered successfully');
        return true;
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

  return {
    accepted,
    isPending: registerAcceptanceMutation.isPending,
    handleAccept: () => {
      console.log('User clicked to accept privacy policy');
      registerAcceptanceMutation.mutate();
    }
  };
};
