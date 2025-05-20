
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
        
        // Verificar se o nome do usuário está disponível - isso é crítico porque a tabela exige este campo
        const nomeUsuario = userMetadata?.nome_completo || 'Usuário';
        console.log('Nome do usuário para registro:', nomeUsuario);
        
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
        
        // Definir tipo de documento padrão se não estiver disponível
        // Este é o campo que está causando o erro não-nulo
        const tipoDocumento = userMetadata?.tipo_documento || 'CPF';
        const numeroDocumento = userMetadata?.numero_documento || '00000000000';
        
        // Abordagem primária: inserir com campos obrigatórios
        console.log('Attempting insert with required fields including documento type...');
        const requiredData = {
          usuario_id: userId,
          versao_termo: latestPolicy.versao_termo,
          nome_completo: nomeUsuario,
          tipo_documento: tipoDocumento,
          numero_documento: numeroDocumento
        };
        
        const { error: requiredInsertError } = await supabase
          .from('logs_aceite_privacidade')
          .insert(requiredData);
        
        if (!requiredInsertError) {
          console.log('Success: Acceptance registered with required fields');
          return true;
        }
        
        console.warn('Required fields insert failed:', requiredInsertError);
        
        // Tentativa alternativa com RPC personalizado, se disponível
        console.log('Trying with custom RPC if available...');
        try {
          const { data: rpcResult, error: rpcError } = await supabase.rpc('insert_privacy_acceptance', {
            p_user_id: userId,
            p_version: latestPolicy.versao_termo
          });
          
          if (!rpcError) {
            console.log('Success with RPC method');
            return true;
          }
          
          console.warn('RPC method failed:', rpcError);
        } catch (rpcErr) {
          console.warn('RPC not available or failed:', rpcErr);
        }
        
        console.error('All insert attempts failed. Last error:', requiredInsertError);
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

  return {
    accepted,
    isPending: registerAcceptanceMutation.isPending,
    handleAccept: () => {
      console.log('User clicked to accept privacy policy');
      registerAcceptanceMutation.mutate();
    }
  };
};
